//Node_modules
require("dotenv").config();
global.config = require("../config");
const db = require("./db");

const { countryRepository } = require("../repositories");
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

(async () => {
  await db.startDataBase();
  await addCountriesCitiesAirports();
  await db.stopDatabase();
})()