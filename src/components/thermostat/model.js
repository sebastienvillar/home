const db = require('../../lib/db');
const switchApi = require('../../lib/apis/switch');
const thermometerApi = require('../../lib/apis/thermometer');

const TEMPERATURE_RETRIES_MAX = 5;

// Public

// Model
// {
//   temperature: number <remote>,
//   targetTemperature: number <stored>,
//   mode: string (warm/cool) <stored>,
//   status: string (on/off) <remote>,
// }

exports.init = async function () {
  const json = db.get();
  if (!json.thermostat) {
    db.set({
      'thermostat.targetTemperature': 21,
      'thermostat.mode': 'warm',
    });
  }
}

// Mix

exports.get = async function() {
  const [thermostat, temperature, status] = await Promise.all([
    exports.getStored(),
    getLocalTemperature(),
    getLocalStatus(),
  ]);

  thermostat.status = status;
  thermostat.temperature = temperature;
  return thermostat;
}

// Remote

exports.getRemoteTemperature = async function() {
  const newTemperature = await thermometerApi.get();
  temperature = newTemperature;
  return temperature;
}

exports.getRemoteStatus = async function() {
  const newStatus = await switchApi.getStatus();
  status = newStatus
  return status;
}

exports.setRemoteStatus = async function(newStatus) {
  await switchApi.setStatus(newStatus);
  status = newStatus;
}

// Stored

exports.getStored = async function() {
  return db.get().thermostat;
}

exports.setStoredTargetTemperature = async function(targetTemperature) {
  return db.set({
    'thermostat.targetTemperature': targetTemperature,
  });
}

exports.setStoredMode = async function(mode) {
  return db.set({
    'thermostat.mode': mode,
  });
}

// Private

let temperature = null;
let status = null;

// Local

async function getLocalTemperature() {
  // Temperature is slow to fetch so keep a local version
  if (temperature === null) {
    return exports.getRemoteTemperature();
  }
  else {
    return temperature;
  }
}

async function getLocalStatus() {
  // Status is slow to fetch so keep a local version
  if (status === null) {
    return exports.getRemoteStatus();
  }
  else {
    return status;
  }
}