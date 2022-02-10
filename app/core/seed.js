//Node_modules
require("dotenv").config();
global.config = require("../config");
const db = require("./db/mongo");

const { countryRepository, flightInfoRepository } = require("../repositories");
const { Country } = require("../models/documents");

const data = require("./initData");
const { ETravelClass } = require("../constants");

const addCountriesCitiesAirports = async () => {
  await countryRepository.deleteMany();

  const countries = data.countries.filter(country => !!country.DialingCode).map(country => ({
    code: country.CountryCode,
    name: country.CountryName,
    dialingCode: parseInt(country.DialingCode.replace(/[\+\-]/g, "").split(" ")[0]),
    cities: data.cities.filter(city => city.CountryCode === country.CountryCode).map(city => ({
      code: city.CityCode,
      name: city.CityName,
      airports: data.airports.filter(airport => airport.CountryCode === country.CountryCode && airport.CityCode === city.CityCode).map(airport => ({
        code: airport.AirportCode,
        name: airport.AirportName,
        description: airport.Fulltext,
        location: {
          latitude: 0,
          longitude: 0,
        }
      }))
    }))
  }));

  await Country.insertMany(countries);
};

const addSampleFlightInfos = async () => {
  await flightInfoRepository.deleteMany();

  // const waypoints = [...data.cities.map(city => city.CityCode), ...data.airports.map(airport => airport.AirportCode)];
  // const waypoints = data.airports.map(airport => airport.AirportCode);

  const agrCountry = Country.aggregate();
  agrCountry.append({ $unwind: "$cities" });
  agrCountry.append({ $unwind: "$cities.airports" });
  agrCountry.append({ $replaceRoot: { newRoot: "$cities" } });
  const waypoints = (await agrCountry.exec()).map(city => ({
    airport: {
      code: city.airports.code,
      name: city.airports.name,
      description: city.airports.description
    },
    city: {
      code: city.code,
      name: city.name,
    },
  }));
  const airlines = data.airlines.map(airline => ({ code: airline.AirLineCode, name: airline.AirLineName, description: airline.Fulltext }));

  const count = 30;
  const maxSearchCount = 200;
  const daysAfterToday = 10;

  for (let i = 0; i < count; i++) {
    const randomOrigin = waypoints[Math.ceil(Math.random() * waypoints.length)];
    const randomDestination = waypoints[Math.ceil(Math.random() * waypoints.length)];
    const randomAirline = airlines[Math.ceil(Math.random() * airlines.length)];

    const time = new Date();
    time.setDate(time.getDate() + Math.floor(Math.random() * daysAfterToday));
    time.setHours(12);
    time.setMinutes(15);
    time.setSeconds(0);
    time.setMilliseconds(0);
    const flightInfo = await flightInfoRepository.createFlightInfo(randomOrigin.city, randomDestination.city, time);

    for (let j = 0; j < Math.random() * maxSearchCount; j++) {
      let code = await flightInfoRepository.generateUniqueCode();

      const searchedIndex = flightInfo.searches.push({
        code,
        filter: {
          stops: [0],
          airports: [],
          airlines: [],
          priceFrom: 0,
          priceTo: 0,
          departureTimeFrom: 0,
          departureTimeTo: 0,
          arrivalTimeFrom: 0,
          arrivalTimeTo: 0,
          durationFrom: 0,
          durationTo: 0,
        }
      }) - 1;
      const flightDetailsIndex = flightInfo.searches[searchedIndex].flights.length;
      flightInfo.searches[searchedIndex].flights.push({
        code: flightDetailsIndex,
        travelClass: ETravelClass.get("BUSINESS"),
        availableSeats: Math.ceil(Math.random() * 8 + 1),
        price: Math.floor(Math.random() * 30000 + 50) / 100,
      }) - 1;

      const itineraryIndex = flightInfo.searches[searchedIndex].flights[flightDetailsIndex].itineraries.push({
        duration: Math.ceil(Math.random() * 600),
      }) - 1;

      const segmentIndex = flightInfo.searches[searchedIndex].flights[flightDetailsIndex].itineraries[itineraryIndex].segments.push({
        duration: Math.min(Math.ceil(Math.random() * 600), flightInfo.searches[searchedIndex].flights[flightDetailsIndex].itineraries[itineraryIndex].duration),
        flightNumber: "963",
        aircraft: "BOEING 777-300ER",
        airline: randomAirline,
        departure: {
          airport: randomOrigin.airport,
          city: randomOrigin.city,
          terminal: "1",
          at: time,
        },
        arrival: {
          airport: randomDestination.airport,
          city: randomDestination.city,
          terminal: "1",
          at: time,
        },
      }) - 1;
    }
    await flightInfo.save();
  }
};

(async () => {
  await db.startDatabase();
  await addCountriesCitiesAirports();
  await addSampleFlightInfos();
  await db.stopDatabase();
})()