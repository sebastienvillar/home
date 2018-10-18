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
  const [lights, thermostat, user, awayValue] = await Promise.all([
    lightsModel.getAll(),
    thermostatModel.get(),
    usersModel.get(id),
    usersModel.getStoredAwayValueForAll(),
  ]);

  return {
    lights: lights,
    thermostat: thermostat,
    user: user,
    users: {
      awayValue: awayValue,
    },
  };
};