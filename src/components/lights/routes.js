const { Keys } = require('../../lib/constants');
const rootManager = require('../root/manager');
const manager = require('./manager');
const db = require('../../lib/db');

module.exports = {
  '/lights/:id': {
    patch: patch,
  },
}

async function patch(req, res) {
  if (!req.body || !req.query.id) {
    res.sendStatus(400);
    return;
  }

  const id = req.params.id;
  const keyToValue = {};

  if (req.body.status !== undefined) {
    keyToValue[manager.createLightKey(Keys.light.status, id)] = req.body.status;
  }

  await db.setAllAsync(keyToValue);
  const result = await rootManager.get(req.query.id);
  return res.status(200).send(result);
}