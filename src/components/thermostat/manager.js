const { RootKeys, ThermostatMode } = require('../../lib/constants');
const config = require('../../config');
const db = require('../../lib/db');
const dbChangeEmitter = require('../../lib/dbChangeEmitter');
const switchDevice = require('../../lib/devices/switch');

const DEFAULT_TEMPERATURE = 21;
const DEFAULT_TARGET_TEMPERATURE = 21;
const TARGET_TEMPERATURE_OFFSET = 1;
const DEFAULT_MODE = ThermostatMode.warm;
const TEMPERATURE_FETCH_INTERVAL = 5000; //30s
const SWITCH_IP = config.thermostatSwitchIP;

// Public

exports.init = async () => {
  // Listen to key changes
  dbChangeEmitter.on(dbChangeEmitter.changeEvent, refreshSwitch);

  // Set thermostat if needed
  let thermostat = await db.hgetall(RootKeys.thermostat);
  if (thermostat === null) {
    thermostat = {};
    thermostat.temperature = DEFAULT_TEMPERATURE;
    thermostat.targetTemperature = DEFAULT_TARGET_TEMPERATURE;
    thermostat.mode = DEFAULT_MODE;
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
  const thermostat = await db.hgetall(RootKeys.thermostat);
  if (thermostat === null) {
    return;
  }

  const minTargetTemperature = thermostat.targetTemperature - TARGET_TEMPERATURE_OFFSET;
  const maxTargetTemperature = thermostat.targetTemperature + TARGET_TEMPERATURE_OFFSET;

  if (thermostat.mode == ThermostatMode.warm) {
    if (thermostat.temperature < minTargetTemperature) {
      // Turn it on
      await switchDevice.turnOn(SWITCH_IP);
    }
    else {
      // Turn it off
      await switchDevice.turnOff(SWITCH_IP);
    }
  }
  else if (thermostat.mode == ThermostatMode.cool) {
    if (thermostat.temperature > maxTargetTemperature) {
      // Turn it on
      await switchDevice.turnOn(SWITCH_IP);
    }
    else {
      // Turn it off
      await switchDevice.turnOff(SWITCH_IP);
    }
  }
}

