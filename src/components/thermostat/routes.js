const db = require('../../lib/db');
const rootModel = require('../root/model');
const thermostatModel = require('./model');
const thermostatManager = require('./manager');

module.exports = {
  '/thermostat': {
    patch: patch,
  },
}

async function patch(req, res) {
  // Get arguments
  if (!req.body || !req.query.id) {
    res.sendStatus(400);
    return;
  }

  const userId = req.query.id;
  
  try {
    // Set values
    if (req.body.targetTemperature !== undefined) {
      await thermostatModel.setStoredTargetTemperature(req.body.targetTemperature);   
    }

    if (req.body.mode !== undefined) {
      await thermostatModel.setStoredMode(req.body.mode);   
    }

    // Refresh thermostat
    await thermostatManager.refresh();

    // Send result
    const result = await rootModel.get(userId);
    return res.status(200).send(result);
  } catch(e) {
    return res.status(500).send({
      message: e.message,
    });
  }
}