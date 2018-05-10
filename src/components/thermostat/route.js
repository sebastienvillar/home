const { RootKeys } = require('../../lib/constants');
const db = require('../../lib/db');

exports.route = '/thermostat';

exports.get = async function(req, res) {
  const thermostat = await db.hgetall(RootKeys.thermostat);
  if (thermostat === null) {
    res.status(500).send();
  }
  else {
    const result = {};
    result.temperature = parseFloat(thermostat.temperature);
    result.targetTemperature = parseFloat(thermostat.targetTemperature);
    result.mode = thermostat.mode;
    res.send(result);
  }
}

exports.patch = async function(req, res) {
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