const { RootKeys, UserAwayMethod, UserAwayValue } = require('../../lib/constants');
const usersManager = require('./manager');
const db = require('../../lib/db');

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
  const baseId = req.params.id;
  const userId = createUserId(baseId);
  let user = await db.hgetall(userId);

  if (user === null) {
    user = createUser(baseId);
    await db.hmset(userId, user);
    await db.sadd(RootKeys.users, userId);
  }

  res.send({
    awayMethod: user.awayMethod,
    awayValue: user.awayValue,
  });
}

async function patchUser(req, res) {
  if (!req.body) {
    res.status(400).send();
    return;
  }

  const baseId = req.params.id;
  const userId = createUserId(baseId);
  let user = await db.hgetall(userId);
  if (user === null) {
    res.status(500).send();
    return;
  }

  const keys = [
    'awayMethod',
    'awayValue',
  ];

  keys.forEach(key => {
    if (req.body[key] !== undefined) {
      user[key] = req.body[key];
    }
  });

  if (await db.hmset(userId, user) != 'OK') {
    res.status(500).send();
    return;
  }

  res.send();
}

async function getUsers(req, res) {
  const awayValue = await usersManager.getAwayValue();
  res.send({
    awayValue: awayValue
  });
}

function createUser(id) {
  return {
    id: id,
    awayMethod: UserAwayMethod.manual,
    awayValue: UserAwayValue.away,
  }
}

function createUserId(id) {
  return `${RootKeys.users}-${id}`;
}