const { RootKeys, ThermostatMode, UserAwayValue } = require('../../lib/constants');
const config = require('../../config');
const db = require('../../lib/db');
const dbChangeEmitter = require('../../lib/dbChangeEmitter');
const switchDevice = require('../../lib/apis/switch');
const usersManager = require('../users/manager');

const TARGET_TEMPERATURE_OFFSET = 1;
const TEMPERATURE_FETCH_INTERVAL = 5000; //30s

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
  const temperature = Math.random() * 40;
  const thermostat = await db.hgetall(RootKeys.thermostat);
  if (thermostat === null) {
    return;
  }

  thermostat.temperature = temperature;
  await db.hmset(RootKeys.thermostat, thermostat);
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

  const minTargetTemperature = thermostat.targetTemperature - TARGET_TEMPERATURE_OFFSET;
  const maxTargetTemperature = thermostat.targetTemperature + TARGET_TEMPERATURE_OFFSET;
  
  if (thermostat.mode == ThermostatMode.warm) {
    if (thermostat.temperature < minTargetTemperature) {
      // Turn it on
      await switchDevice.turnOn(config.thermostatSwitchIP);
    }
    else {
      // Turn it off
      await switchDevice.turnOff(config.thermostatSwitchIP);
    }
  }
  else if (thermostat.mode == ThermostatMode.cool) {
    if (thermostat.temperature > maxTargetTemperature) {
      // Turn it on
      await switchDevice.turnOn(config.thermostatSwitchIP);
    }
    else {
      // Turn it off
      await switchDevice.turnOff(config.thermostatSwitchIP);
    }
  }
}

