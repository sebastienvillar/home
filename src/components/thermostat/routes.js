const { Keys } = require('../../lib/constants');
const rootManager = require('../root/manager');
const thermostatManager = require('./manager');
const db = require('../../lib/db');
const dbHelper = require('../../lib/dbHelper');

module.exports = {
  '/thermostat': {
    patch: patch,
  },
}

async function patch(req, res) {
  if (!req.body || !req.query.id) {
    res.sendStatus(400);
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
  const result = await rootManager.get(req.query.id);
  return res.status(200).send(result);
}