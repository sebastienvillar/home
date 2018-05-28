const { Keys, UserAwayMethod, UserAwayValue } = require('../../lib/constants');
const db = require('../../lib/db');
const dbHelper = require('../../lib/dbHelper');
const util = require('util');

// Public

exports.init = async () => {
  // Nothing to do
}

exports.getUser = async function(id) {
  await exports.createUserIfNeeded(id);
  
  const keys = [
    exports.createUserKey(Keys.user.id, id),
    exports.createUserKey(Keys.user.awayMethod, id),
    exports.createUserKey(Keys.user.awayValue, id),
  ];

  const keyToValue = await dbHelper.getAllAsync(keys);

  return {
    id: keyToValue[keys[0]],
    awayMethod: keyToValue[keys[1]],
    awayValue: keyToValue[keys[2]],
  };
}

exports.getAll = async function() {
  return {
    awayValue: await getAwayValue(),
  }
}

exports.createUserIfNeeded = async function(id) {
  const keyToValue = {};
  keyToValue[exports.createUserKey(Keys.user.id, id)] = id;
  keyToValue[exports.createUserKey(Keys.user.awayMethod, id)] = UserAwayMethod.manual;
  keyToValue[exports.createUserKey(Keys.user.awayValue, id)] = UserAwayValue.away;

  const userIds = await db.smembersAsync(Keys.userIds);
  if (!userIds.includes(id)) {
    await db.saddAsync(Keys.userIds, id);
  }

  return dbHelper.setAllIfNotExistAsync(keyToValue);
}

exports.createUserKey = function(key, id) {
  return util.format(key, id);
}

async function getAwayValue() {
  const ids = await db.smembersAsync(Keys.userIds);
  const awayValueKeys = ids.map(id => exports.createUserKey(Keys.user.awayValue, id));
  const keyToValue = await dbHelper.getAllAsync(awayValueKeys);
  const areSomeUsersHome = Object.values(keyToValue).some(awayValue => awayValue === UserAwayValue.home);
  return areSomeUsersHome ? UserAwayValue.home : UserAwayValue.away;
}