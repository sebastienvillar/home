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
    exports.getRemoteTemperature(),
    exports.getRemoteStatus(),
  ]);

  thermostat.status = status;
  thermostat.temperature = temperature;
  return thermostat;
}

// Remote

exports.getRemoteTemperature = async function() {
  return thermometerApi.get();
}

exports.getRemoteStatus = async function() {
  return switchApi.getStatus();
}

exports.setRemoteStatus = async function(status) {
  return switchApi.setStatus(status);
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

