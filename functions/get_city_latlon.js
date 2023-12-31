const fs = require( "fs");
const path = require("path");

const execute = async (city) => {

  // get key from env. see https://home.openweathermap.org/api_keys
  const key = process.env.WEATHER_API_KEY;
  let city = city;
  let state = "";
  let country = ""
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`
  const response = await fetch(url);
  return response;

}
const details = {
  name: "get_city_latlon",
  description: "Given city get the lat, lon location",
  parameters: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "The name of the city",
      },
      country: {
        type: "string",
        description: "Country name'"
      },
    },
    required: ["city"]
  },
  example: "Find the lat/lon of a city with the name 'Tokyo, Japan'",
};

module.exports = { execute, details };