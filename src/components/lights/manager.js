const { Keys, LightStatus, UserAwayValue } = require('../../lib/constants');
const db = require('../../lib/db');
const lightApi = require('../../lib/apis/light');
const config = require('../../../config');
const util = require('util');
const usersManager = require('../users/manager');

const LIGHTS_KEEP_ALIVE_INTERVAL = 5000 // 1h

// Public

exports.init = async () => {
  // Listen to db changes
  db.onKeysChange([
    util.format(Keys.user.awayValue, '[^-]*'),
  ], refreshStatus);

  db.onKeysChange([
    util.format(Keys.light.status, '[^-]*'),
  ], refreshLights);

  await initialize();

  // Start temperature refresh
  setInterval(refreshLights, LIGHTS_KEEP_ALIVE_INTERVAL);
}

exports.getAll = async function (id) {
  const ids = await db.smembersAsync(Keys.lightIds);
  const promises = ids.map(async (id) => {
    const keys = [
      exports.createLightKey(Keys.light.id, id),
      exports.createLightKey(Keys.light.name, id),
      exports.createLightKey(Keys.light.status, id),
    ];

    const keyToValue = await db.getAllAsync(keys);
    return {
      id: keyToValue[keys[0]],
      name: keyToValue[keys[1]],
      status: keyToValue[keys[2]],
    };
  });

  return Promise.all(promises);
};

exports.createLightKey = (key, id) => {
  return util.format(key, id);
}

// Private

async function initialize() {
  const ids = await db.smembersAsync(Keys.lightIds);
  const jsons = await lightApi.getAll(config.hueIP, config.hueUsername);
  if (!jsons) {
    return;
  }

  const keyToValue = {};
  for (const id in jsons) {
    if (!ids.includes(id)) {
      const json = jsons[id];
      keyToValue[exports.createLightKey(Keys.light.id, id)] = id;
      keyToValue[exports.createLightKey(Keys.light.name, id)] = json.name;
      keyToValue[exports.createLightKey(Keys.light.status, id)] = json.state.any_on ? LightStatus.on : LightStatus.off;
      await db.saddAsync(Keys.lightIds, id);
    };
  }

  return db.setAllIfNotExistAsync(keyToValue);
}

async function refreshStatus() {
  // Current statuses
  const lights = await exports.getAll();
  const currentStatuses = lights.map(l => l.status);

  // New statuses
  const awayValue = (await usersManager.getAll()).awayValue;
  const newStatus = awayValue === UserAwayValue.home ? LightStatus.on : LightStatus.off;
  const keyToValue = {};
  for (const light of lights) {
    keyToValue[exports.createLightKey(Keys.light.status, light.id)] = newStatus;
  }

  if (!currentStatuses.every(s => s === newStatus)) {
    // Only set when changed to avoid too many refresh of lights
    // Refresh manually instead of listening to db to avoid multiple requests
    return db.setAllAsync(keyToValue);
  }
}

async function refreshLights() {
  const lights = await exports.getAll();
  const promises = lights.map((light) => {
    if (light.status === LightStatus.on) {
      return lightApi.turnOn(config.hueIP, config.hueUsername, light.id);
    }
    else {
      return lightApi.turnOff(config.hueIP, config.hueUsername, light.id);
    }
  });

  return Promise.all(promises);
}