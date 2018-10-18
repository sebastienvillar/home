const fs = require('fs');
const setValue = require('set-value');

const DB_DIRECTORY = `${__dirname}/../../storage`;
const DB_PATH = `${DB_DIRECTORY}/db.json`;
const WRITE_TO_FILE_INTERVAL = 5000 // 10 seconds

let shouldWriteToFile = false;
let memory = null;

// Public

exports.init = async function() {
  // Create directory
  if (!fs.existsSync(DB_DIRECTORY)) {
    fs.mkdirSync(DB_DIRECTORY);
  }

  // Load memory
  memory = await readFromFile();

  // Schedule write to file
  setInterval(() => {
    writeToFileIfNeeded();
  }, WRITE_TO_FILE_INTERVAL);
}

exports.get = function() {
  return copy(memory);
}

exports.set = function(pathToValues) {
  for (const [path, value] of Object.entries(pathToValues)) {
    memory = copy(memory);
    setValue(memory, path, value);
    shouldWriteToFile = true;
  }
}

// Private

function readFromFile() {
  return new Promise((resolve, reject) => {
    // Read
    if (!fs.existsSync(DB_PATH)) {
      resolve({});
      return;
    }

    fs.readFile(DB_PATH, (e, data) => {
      if (e) {
        console.error(`Could not read from file: ${e}`);
        reject(e);
      }
      else {
        try {
          // Parse
          const json = JSON.parse(data)
          resolve(json);
        } catch (e) {
          console.error(`Couldn't parse JSON from file: ${e}`);
          reject(e);
        }
      }
    });
  });
}

function writeToFileIfNeeded() {
  if (!shouldWriteToFile) {
    return;
  }

  try {
    // Serialize
    const jsonString = JSON.stringify(memory, null, 4);

    // Write to file
    fs.writeFile(DB_PATH, jsonString, (e) => {
      if (e) {
        console.error(`Couldn't write to file: ${e}`);
      }
      else {
        shouldWriteToFile = false;
      }
    });
  } catch(e) {
    console.error(`Couldn't write to file: ${e}`);
  }
}

function copy(json) {
  return JSON.parse(JSON.stringify(json));
}