const lightsModel = require('../lights/model');
const thermostatModel = require('../thermostat/model');
const usersModel = require('../users/model');

// Public

// Model
// {
//   lights: lights/model,
//   thermostat: thermostat/model,
//   user: users/model,
//   users: { awayValue: string },
// }

exports.init = async function () {
  // Nothing to do
}

// Mix

exports.get = async function (id) {
  return {
    lights: await lightsModel.getAll(),
    thermostat: await thermostatModel.get(),
    user: await usersModel.get(id),
    users: {
      awayValue: await usersModel.getStoredAwayValueForAll(),
    },
  };
};