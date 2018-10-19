const logger = require('../../lib/logger');
const thermostatModel = require('./model');
const usersModel = require('../users/model');

// Public

exports.init = async function() {
  // Start status refreshes
  setInterval(async () => {
    try {
      // Refresh temperature
      await thermostatModel.getRemoteTemperature();

      // Refresh
      await exports.refresh();
    } catch(e) {}
  }, REFRESH_STATUS_INTERVAL);
}

exports.refresh = async function () {
  const newStatus = await getNewStatus();
  const thermostat = await thermostatModel.get();

  if (newStatus === thermostat.status) {
    // No change needed
    return
  }

  const lastStatusChangeInterval = Date.now() - lastRefreshTimestamp;
  const targetTemperatureChanged = thermostat.targetTemperature !== lastTargetTemperature;
  lastTargetTemperature = thermostat.targetTemperature;
  if (lastStatusChangeInterval < REFRESH_STATUS_CHANGE_INTERVAL && !targetTemperatureChanged) {
    // Target temperature didn't change and it has not been long enough since last status change
    logger.info(`Do not update status yet to "${newStatus}". Last interval: ${lastStatusChangeInterval}`);
    return;
  }

  // Update status
  logger.info(`Update thermostat status: "${newStatus}" for temperature: ${thermostat.temperature}, targetTemperature: ${thermostat.targetTemperature}, mode: "${thermostat.mode}", oldStatus: ${thermostat.status}`);
  await thermostatModel.setRemoteStatus(newStatus);
  lastRefreshTimestamp = Date.now();
}

// Private

const TARGET_TEMPERATURE_OFFSET = 0.2;
const REFRESH_STATUS_INTERVAL = 45 * 1000; // 45s
const REFRESH_STATUS_CHANGE_INTERVAL = 5 * 60 * 1000 // 5 minutes

let lastTargetTemperature = null;
let lastRefreshTimestamp = Number.MIN_VALUE;

async function getNewStatus() {
  // Get values
  const [thermostat, awayValue] = await Promise.all([
    thermostatModel.get(),
    usersModel.getStoredAwayValueForAll(),
  ]);

  // Create new status
  if (awayValue === 'away') {
    return 'off';
  }

  if (thermostat.mode == 'warm') {
    const offsetTargetTemperature = thermostat.targetTemperature - TARGET_TEMPERATURE_OFFSET;
    return thermostat.temperature <= offsetTargetTemperature ? 'on' : 'off';
  }
  else {
    const offsetTargetTemperature = thermostat.targetTemperature + TARGET_TEMPERATURE_OFFSET;
    return thermostat.temperature >= offsetTargetTemperature ? 'on' : 'off';
  }
}