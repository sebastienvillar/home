const { Keys, HeaterMode, Status } = require('../../lib/constants');
const config = require('../../config');
const db = require('../../lib/db');
const dbChangeEmitter = require('../../lib/dbChangeEmitter');
const switchDevice = require('../../lib/devices/switch');

const DEFAULT_TEMPERATURE = 21;
const DEFAULT_TARGET_TEMPERATURE = 21;
const TARGET_TEMPERATURE_OFFSET = 1;
const DEFAULT_HEATER_MODE = HeaterMode.warm;
const DEFAULT_STATUS = Status.off;
const TEMPERATURE_FETCH_INTERVAL = 5000; //30s
const SWITCH_IP = config.thermostatSwitchIP;

// Public

exports.init = async () => {
  // Listen to key changes
  dbChangeEmitter.on(dbChangeEmitter.changeEvent, refreshSwitch);

  // Set keys if needed
  if (!await db.exists(Keys.temperature)) {
    await db.set(Keys.temperature, DEFAULT_TEMPERATURE);
  }

  if (!await db.exists(Keys.targetTemperature)) {
    await db.set(Keys.targetTemperature, DEFAULT_TARGET_TEMPERATURE);
  }

  if (!await db.exists(Keys.heaterMode)) {
    await db.set(Keys.heaterMode, DEFAULT_HEATER_MODE);
  }

  if (!await db.exists(Keys.status)) {
    await db.set(Keys.status, DEFAULT_STATUS);
  }

  // Start temperature refresh
  setInterval(refreshTemperature, TEMPERATURE_FETCH_INTERVAL);
}

// Private

async function refreshTemperature() {
  const temperature = Math.random() * 40;
  return db.set(Keys.temperature, temperature);
}

async function refreshSwitch() {
  const status = await db.get(Keys.status);
  if (status === Status.off) {
    return
  }

  const temperature = parseFloat(await db.get(Keys.temperature));
  const targetTemperature = parseFloat(await db.get(Keys.targetTemperature));
  const minTargetTemperature = targetTemperature - TARGET_TEMPERATURE_OFFSET;
  const maxTargetTemperature = targetTemperature + TARGET_TEMPERATURE_OFFSET;
  const heaterMode = await db.get(Keys.heaterMode);

  if (heaterMode == HeaterMode.warm) {
    if (temperature < minTargetTemperature) {
      // Turn it on
      await switchDevice.turnOn(SWITCH_IP);
    }
    else {
      // Turn it off
      await switchDevice.turnOff(SWITCH_IP);
    }
  }
  else if (heaterMode == HeaterMode.cool) {
    if (temperature > maxTargetTemperature) {
      // Turn it on
      await switchDevice.turnOn(SWITCH_IP);
    }
    else {
      // Turn it off
      await switchDevice.turnOff(SWITCH_IP);
    }
  }
}

