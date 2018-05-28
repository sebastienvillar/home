const { Keys, ThermostatMode, ThermostatStatus, UserAwayValue } = require('../../lib/constants');
const config = require('../../../config');
const db = require('../../lib/db');
const dbListener = require('../../lib/dbListener');
const dbHelper = require('../../lib/dbHelper');
const switchDevice = require('../../lib/apis/switch');
const usersManager = require('../users/manager');
const thermometer = require('../../lib/apis/thermometer');
const util = require('util');

const TARGET_TEMPERATURE_OFFSET = 0.5;
const TEMPERATURE_FETCH_INTERVAL = 45 * 1000; // 45s
const TEMPERATURE_RETRIES_MAX = 5;
const SWITCH_KEEP_ALIVE_INTERVAL = 60 * 60 * 1000 // 1h

// Public

exports.init = async function() {
  // Listen to db changes
  dbListener.on([
    Keys.thermostat.temperature,
    Keys.thermostat.targetTemperature,
    Keys.thermostat.mode,
    util.format(Keys.user.awayValue, '*'),
  ], refreshStatus);

  dbListener.on([
    Keys.thermostat.status
  ], refreshSwitch);

  // Init thermostat values
  await initialize();
    
  // Start temperature refresh
  setInterval(refreshTemperature, TEMPERATURE_FETCH_INTERVAL);
  setInterval(refreshSwitch, SWITCH_KEEP_ALIVE_INTERVAL);
}

exports.get = async function() {
  const keys = [
    Keys.thermostat.temperature,
    Keys.thermostat.targetTemperature,
    Keys.thermostat.mode,
    Keys.thermostat.status,
  ];

  const keyToValue = await dbHelper.getAllAsync(keys);

  return {
    temperature: parseFloat(keyToValue[keys[0]]),
    targetTemperature: parseFloat(keyToValue[keys[1]]),
    mode: keyToValue[keys[2]],
    status: keyToValue[keys[3]],
  }
}

// Private

async function initialize() {
  const keyToDefault = {};
  keyToDefault[Keys.thermostat.temperature] = 21;
  keyToDefault[Keys.thermostat.targetTemperature] = 21;
  keyToDefault[Keys.thermostat.mode] = ThermostatMode.warm;
  keyToDefault[Keys.thermostat.status] = ThermostatStatus.off;
  dbHelper.setAllIfNotExistAsync(keyToDefault);
}

async function refreshTemperature() {
  let temperature = await thermometer.read(config.thermostatThermometerPin, TEMPERATURE_RETRIES_MAX);
  if (temperature !== undefined && temperature !== null) {
    temperature = Math.round(temperature * 10) / 10;
    return db.setAsync(Keys.thermostat.temperature, temperature);
  }
}

async function refreshStatus() {
  const currentStatus = await db.getAsync(Keys.thermostat.status);
  const newStatus = await (async () => {
    const awayValue = (await usersManager.getAll()).awayValue;
    if (awayValue === UserAwayValue.home) {
      // Home
      const thermostat = await exports.get();
      const temperature = thermostat.temperature;

      if (thermostat.mode == ThermostatMode.warm) {
        const offsetTargetTemperature = thermostat.targetTemperature - TARGET_TEMPERATURE_OFFSET;
        if (thermostat.status === ThermostatStatus.on) {
          // Keep going until we're at target temperature
          return temperature < targetTemperature ? ThermostatStatus.on : ThermostatStatus.off;
        }
        else {
          // Trigger only if lower than offsetTargetTemperature
          return temperature < offsetTargetTemperature ? ThermostatStatus.on : ThermostatStatus.off;
        }
      }
      else {
        const offsetTargetTemperature = thermostat.targetTemperature + TARGET_TEMPERATURE_OFFSET;
        if (thermostat.status === ThermostatStatus.on) {
          // Keep going until we're at target temperature
          return temperature > targetTemperature ? ThermostatStatus.on : ThermostatStatus.off;
        }
        else {
          // Trigger only if higher than offsetTargetTemperature
          return temperature > offsetTargetTemperature ? ThermostatStatus.on : ThermostatStatus.off;
        }
      }
    }
    else {
      // Away
      return ThermostatStatus.off;
    }
  })()

  if (currentStatus !== newStatus) {
    // Only set when changed to avoid too many refresh of switch
    return db.setAsync(Keys.thermostat.status, newStatus);
  }
}

async function refreshSwitch() {
  const status = await db.getAsync(Keys.thermostat.status);
  if (status === ThermostatStatus.on) {
    switchDevice.turnOn(config.thermostatSwitchIP);
  }
  else {
    switchDevice.turnOff(config.thermostatSwitchIP);
  }
}

