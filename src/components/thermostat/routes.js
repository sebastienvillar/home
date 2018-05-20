const { Keys } = require('../../lib/constants');
const thermostatManager = require('./manager');
const db = require('../../lib/db');
const dbHelper = require('../../lib/dbHelper');

module.exports = {
  '/thermostat': {
    get: get,
    patch: patch,
  },
}

async function get(req, res) {
  const json = await thermostatManager.get();
  res.send(json);
}

async function patch(req, res) {
  if (!req.body) {
    res.status(400).send();
    return;
  }

  const keyToValue = {};

  if (req.body.targetTemperature !== undefined) {
    keyToValue[Keys.thermostat.targetTemperature] = req.body.targetTemperature;
  }

  if (req.body.mode !== undefined) {
    keyToValue[Keys.thermostat.mode] = req.body.mode;
  }

  await dbHelper.setAllAsync(keyToValue);
  return res.send();
}