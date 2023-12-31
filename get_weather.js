const fs = require( "fs");
const path = require("path");

const execute = async (location) => {
  // test 
  if (location.toLowerCase().includes("tokyo")) {
    return JSON.stringify({ location: "Tokyo", temperature: "10", unit: "celsius" });
  } else if (location.toLowerCase().includes("san francisco")) {
    return JSON.stringify({ location: "San Francisco", temperature: "72", unit: "fahrenheit" });
  } else if (location.toLowerCase().includes("paris")) {
    return JSON.stringify({ location: "Paris", temperature: "22", unit: "fahrenheit" });
  } else {
    return JSON.stringify({ location, temperature: "unknown" });
  }
  
}
const details = {
  name: "get_weather",
  description: "Given a location, return the temperature",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The name of city or country to get the temperature",
      },
      units: {
        type: "string",
        description: "units for the temperature, either 'celsius' or 'fahrenheit'"
      },
    },
    required: ["location"],
  },
  example: "Find the weather of a city with the name 'Tokyo'",
};


module.exports = { execute, details };
