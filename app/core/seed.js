//Node_modules
require("dotenv").config();
global.config = require("../config");
const db = require("./db/mongo");

const { countryRepository, flightInfoRepository } = require("../repositories");
const { Country } = require("../models/documents");

const data = require("./initData");

const addCountriesCitiesAirports = async () => {
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
  const waypoints = [...data.cities.map(city => city.CityCode), ...data.airports.map(airport => airport.AirportCode)];
  const airlines = data.airlines.map(airline => airline.AirLineCode);

  const count = 30;
  const maxSearchCount = 200;
  const daysAfterToday = 10;

  for (let i = 0; i < count; i++) {
    const randomOrigin = waypoints[Math.ceil(Math.random() * waypoints.length)];
    const randomDestination = waypoints[Math.ceil(Math.random() * waypoints.length)];
    const randomAirline = airlines[Math.ceil(Math.random() * airlines.length)];

    const flight = await flightInfoRepository.createFlightInfo(randomOrigin, randomDestination, randomAirline);

    for (let j = 0; j < Math.random() * maxSearchCount; j++) {
      const time = new Date();
      time.setDate(time.getDate() + Math.floor(Math.random() * daysAfterToday));
      time.setHours(12);
      time.setMinutes(15);
      time.setSeconds(0);
      time.setMilliseconds(0);
      await flightInfoRepository.searchAFlight(flight._id, time, Math.floor(Math.random() * 30000 + 50) / 100);
    }
  }
};

(async () => {
  await db.startDatabase();
  await addCountriesCitiesAirports();
  await addSampleFlightInfos();
  await db.stopDatabase();
})()