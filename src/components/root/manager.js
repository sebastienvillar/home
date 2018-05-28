const thermostatManager = require('../thermostat/manager');
const usersManager = require('../users/manager');
const lightsManager = require('../lights/manager');

// Public

exports.init = async () => {
  // Nothing to do
}

exports.get = async function (id) {
  const user = await usersManager.getUser(id);
  const users = await usersManager.getAll();
  const thermostat = await thermostatManager.get();
  const lights = await lightsManager.getAll();

  return {
    user: user,
    users: users,
    thermostat: thermostat,
    lights: lights,
  };
};