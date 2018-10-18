const logger = require('../logger');
const config = require('../../../config');
const PythonShell = require('python-shell');
const { promisify } = require('util');
const runAsync = promisify(PythonShell.run).bind(PythonShell);

const RETRIES_MAX = 5;

exports.get = async function() {
  const options = {
    mode: 'json',
    scriptPath: 'src/lib/devices/thermometer/',
    args: [config.thermostatThermometerPin, RETRIES_MAX]
  };

  try {
    const result = await runAsync('main.py', options);
    if (result === null) {
      throw new Error('Missing data');
    }

    if (!result || !result[0]) {
      throw new Error(`Invalid data: ${result}`);
    }

    return Math.round(result[0].temperature * 10) / 10;
  } catch(e) {
    logger.error(`Could not get temperature - ${e}`);
    throw new Error(e);
  }
}