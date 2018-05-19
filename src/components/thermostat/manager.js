const { RootKeys, ThermostatMode, UserAwayValue } = require('../../lib/constants');
const config = require('../../../config');
const db = require('../../lib/db');
const dbChangeEmitter = require('../../lib/dbChangeEmitter');
const switchDevice = require('../../lib/apis/switch');
const usersManager = require('../users/manager');
const thermometer = require('../../lib/apis/thermometer');

const TARGET_TEMPERATURE_OFFSET = 1;
const TEMPERATURE_FETCH_INTERVAL = 45000; // 45s
const TEMPERATURE_RETRIES_MAX = 5;

// Public

exports.init = async () => {
  // Listen to key changes
  dbChangeEmitter.on(dbChangeEmitter.changeEvent, refreshSwitch);

  // Set thermostat if needed
  let thermostat = await db.hgetall(RootKeys.thermostat);
  if (thermostat === null) {
    thermostat = {};
    thermostat.temperature = 21;
    thermostat.targetTemperature = 21;
    thermostat.mode = ThermostatMode.warm;
    await db.hmset(RootKeys.thermostat, thermostat);
  }

  // Start temperature refresh
  setInterval(refreshTemperature, TEMPERATURE_FETCH_INTERVAL);
}

// Private

async function refreshTemperature() {
  const thermostat = await db.hgetall(RootKeys.thermostat);
  if (thermostat === null) {
    return;
  }

  temperature = await thermometer.read(config.thermostatThermometerPin, TEMPERATURE_RETRIES_MAX);
  if (temperature !== undefined && temperature !== null) {
    thermostat.temperature = temperature
    await db.hmset(RootKeys.thermostat, thermostat);
  }
}

async function refreshSwitch() {
  const awayValue = await usersManager.getAwayValue();
  if (awayValue === UserAwayValue.away) {
    // Away
    switchDevice.turnOff(config.thermostatSwitchIP);
    return;
  }

  const thermostat = await db.hgetall(RootKeys.thermostat);
  if (thermostat === null) {
    // Can't find the thermostat info
    switchDevice.turnOff(config.thermostatSwitchIP);
    return;
  }

  const temperature = parseFloat(thermostat.temperature);
  const minTargetTemperature = parseFloat(thermostat.targetTemperature) - TARGET_TEMPERATURE_OFFSET;
  const maxTargetTemperature = parseFloat(thermostat.targetTemperature) + TARGET_TEMPERATURE_OFFSET;

  if (thermostat.mode == ThermostatMode.warm) {
    if (temperature < minTargetTemperature) {
      // Turn it on
      await switchDevice.turnOn(config.thermostatSwitchIP);
    }
    else {
      // Turn it off
      await switchDevice.turnOff(config.thermostatSwitchIP);
    }
  }
  else if (thermostat.mode == ThermostatMode.cool) {
    if (temperature > maxTargetTemperature) {
      // Turn it on
      await switchDevice.turnOn(config.thermostatSwitchIP);
    }
    else {
      // Turn it off
      await switchDevice.turnOff(config.thermostatSwitchIP);
    }
  }
}

