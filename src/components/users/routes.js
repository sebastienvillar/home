const { Keys, UserAwayMethod, UserAwayValue } = require('../../lib/constants');
const rootManager = require('../root/manager');
const usersManager = require('./manager');
const db = require('../../lib/db');

module.exports = {
  '/users/:id': {
    patch: patchUser,
  },
}

async function patchUser(req, res) {
  if (!req.body || !req.query.id) {
    res.send(400);
    return;
  }

  const id = req.params.id;
  const ids = await db.smembersAsync(Keys.userIds);
  if (!ids.includes(id)) {
    res.sendStatus(400);
    return;
  }

  const keyToValue = {};

  if (req.body.awayMethod !== undefined) {
    keyToValue[usersManager.createUserKey(Keys.user.awayMethod, id)] = req.body.awayMethod;
  }

  if (req.body.awayValue !== undefined) {
    keyToValue[usersManager.createUserKey(Keys.user.awayValue, id)] = req.body.awayValue;
  }

  await db.setAllAsync(keyToValue);
  const result = await rootManager.get(req.query.id);
  return res.status(200).send(result);
}
