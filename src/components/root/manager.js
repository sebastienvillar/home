const thermostatManager = require('../thermostat/manager');
const usersManager = require('../users/manager');

// Public

exports.init = async () => {
  // Nothing to do
}

exports.get = async function (id) {
  const user = await usersManager.getUser(id);
  const users = await usersManager.getUsers();
  const thermostat = await thermostatManager.get();

  return {
    user: user,
    users: users,
    thermostat: thermostat,
  };
};