const db = require('../../lib/db');
const rootModel = require('../root/model');
const usersModel = require('./model');
const lightsManager = require('../lights/manager');
const thermostatManager = require('../thermostat/manager');

module.exports = {
  '/users/:id': {
    patch: patchUser,
  },
}

async function patchUser(req, res) {
  // Get arguments
  if (!req.body || !req.params.id) {
    res.sendStatus(400);
    return;
  }

  const userId = req.params.id;

  try {
    // Set values
    if (req.body.awayMethod !== undefined) {
      await usersModel.setStoredAwayMethod(userId, req.body.awayMethod)
    }

    if (req.body.awayValue !== undefined) {
      await usersModel.setStoredAwayValue(userId, req.body.awayValue);

      // Refresh managers
      await lightsManager.refresh();
      await thermostatManager.refresh(true);
    }

    // Send result
    const result = await rootModel.get(userId);
    return res.status(200).send(result);
  } catch(e) {
    return res.status(500).send({
      message: e.message,
    });
  }
}
