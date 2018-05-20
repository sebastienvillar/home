const { Keys, UserAwayMethod, UserAwayValue } = require('../../lib/constants');
const usersManager = require('./manager');
const db = require('../../lib/db');
const dbHelper = require('../../lib/dbHelper');

module.exports = {
  '/users/:id': {
    get: getUser,
    patch: patchUser,
  },
  '/users': {
    get: getUsers,
  },
}

async function getUser(req, res) {
  const id = req.params.id;
  const json = await usersManager.get(id)
  res.send(json);
}

async function patchUser(req, res) {
  if (!req.body) {
    res.status(400).send();
    return;
  }

  const id = req.params.id;
  const ids = await db.smembersAsync(Keys.userIds);
  if (!ids.includes(id)) {
    res.status(400).send();
    return;
  }

  const keyToValue = {};

  if (req.body.awayMethod !== undefined) {
    keyToValue[usersManager.createUserKey(Keys.user.awayMethod, id)] = req.body.awayMethod;
  }

  if (req.body.awayValue !== undefined) {
    keyToValue[usersManager.createUserKey(Keys.user.awayValue, id)] = req.body.awayValue;
  }

  await dbHelper.setAllAsync(keyToValue);
  return res.send();
}

async function getUsers(req, res) {
  const awayValue = await usersManager.getAwayValue();
  res.send({
    awayValue: awayValue
  });
}
