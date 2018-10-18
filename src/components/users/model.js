const db = require('../../lib/db');

// Public

exports.init = async () => {
  // Nothing to do
}

// Mix

exports.get = async function(id) {
  // Get user
  const users = db.get().users || [];
  let user = users.find(u => u.id === id);
  if (user) {
    return user;
  }

  // Create user since it doesn't exist
  user = {
    id: id,
    awayMethod: 'manual',
    awayValue: 'away',
  };

  storeUser(user);
  return user;
}

// Stored

exports.getStoredAwayValueForAll = async function() {
  const users = db.get().users || [];
  const isHome = Object.values(users).some(user => user.awayValue === 'home');
  return isHome ? 'home' : 'away';
}

exports.setStoredAwayMethod = async function(id, awayMethod) {
  const user = await exports.get(id);
  user.awayMethod = awayMethod;
  storeUser(user);
}

exports.setStoredAwayValue = async function (id, awayValue) {
  const user = await exports.get(id);
  user.awayValue = awayValue;
  storeUser(user);
}

// Private

function storeUser(user) {
  const users = db.get().users || [];
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
  }
  else {
    users.push(user);
  }

  db.set({
    users: users,
  });
}