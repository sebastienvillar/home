const { RootKeys, UserAwayValue } = require('../../lib/constants');
const db = require('../../lib/db');

// Public

exports.init = async () => {
  // Nothing to do
}

exports.getAwayValue = async () => {
  const userIds = await db.smembers(RootKeys.users);
  const promises = userIds.map(id => {
    return db.hgetall(id);
  });

  const result = await Promise.all(promises);
  const areSomeUsersHome = result.some(user => user.awayValue === UserAwayValue.home);
  return areSomeUsersHome ? UserAwayValue.home : UserAwayValue.away;
}