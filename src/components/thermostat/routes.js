const { RootKeys } = require('../../lib/constants');
const db = require('../../lib/db');

module.exports = {
  '/thermostat': {
    get: get,
    patch: patch,
  },
}

async function get(req, res) {
  const thermostat = await db.hgetall(RootKeys.thermostat);
  if (thermostat === null) {
    res.status(500).send();
    return;
  }

  res.send({
    temperature: parseFloat(thermostat.temperature),
    targetTemperature: parseFloat(thermostat.targetTemperature),
    mode: thermostat.mode,
  });
}

async function patch(req, res) {
  if (!req.body) {
    res.status(400).send();
    return;
  }

  const thermostat = await db.hgetall(RootKeys.thermostat);
  if (thermostat === null) {
    res.status(500).send();
    return;
  }

  const keys = [
    'targetTemperature',
    'mode',
  ];

  keys.forEach(key => {
    if (req.body[key] !== undefined) {
      thermostat[key] = req.body[key];
    }
  });

  if (await db.hmset(RootKeys.thermostat, thermostat) != 'OK') {
    res.status(500).send();
    return;
  }

  res.send();
}