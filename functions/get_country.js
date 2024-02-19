const { exec } = require("child_process");
const fs = require( "fs");
const path = require("path");

const execute = async (name) => {
    const url = `https://api.nationalize.io?name=${name}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    return data;
  }
    catch (error) {
        console.error("Error occurred while getting country:", error);
        throw error;
    }
}

   
const details = {
    "name": "get_country",
    "parameters": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "The name of the person to get the country of origin"
        }
      },
      "required": ["name"]
    },
    "description": "Given a name, return the country of origin",
};
module.exports = { execute, details };