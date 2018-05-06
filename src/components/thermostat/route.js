const { Keys } = require('../../lib/constants');
const db = require('../../lib/db');

exports.route = '/thermostat';

exports.get = async function(req, res) {
  const temperature = await db.get(Keys.temperature);
  const targetTemperature = await db.get(Keys.targetTemperature);
  const heaterMode = await db.get(Keys.heaterMode);

  if (temperature === null || targetTemperature === null || heaterMode === null) {
    res.status(500).send();
  }
  else {
    const result = {};
    result[Keys.temperature] = temperature;
    result[Keys.targetTemperature] = targetTemperature;
    result[Keys.heaterMode] = heaterMode;
    res.send(result);
  }
}

exports.patch = async function(req, res) {
    if (!req.body) {
      res.status(400).send();
      return;
    }

    if (req.body.targetTemperature !== undefined) {
      if (await db.set(Keys.targetTemperature, req.body.targetTemperature) !== 'OK') {
        res.status(500).send();
      }
    }

    if (req.body.heaterMode !== undefined) {
      if (await db.set(Keys.heaterMode, req.body.heaterMode) !== 'OK') {
        res.status(500).send();
      }
    }

    res.send();
}