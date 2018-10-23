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
      await exports.refresh(false);
    } catch(e) {}
  }, REFRESH_STATUS_INTERVAL);
}

exports.refresh = async function(ignoreInterval) {
  const newStatus = await getNewStatus();
  const thermostat = await thermostatModel.get();

  if (newStatus === thermostat.status) {
    // No change needed
    logger.info(`Do not update status because no status change: ${newStatus}`);
    return
  }

  if (!ignoreInterval && (Date.now() - lastRefreshTimestamp) < REFRESH_STATUS_CHANGE_INTERVAL) {
    // Target temperature didn't change and it has not been long enough since last status change
    logger.info(`Do not update status yet to ${newStatus}. Last interval: ${lastStatusChangeInterval}`);
    return;
  }

  // Update status
  logger.info(`Update thermostat status to ${newStatus}, oldStatus: ${thermostat.status}`);
  await thermostatModel.setRemoteStatus(newStatus);
  lastRefreshTimestamp = Date.now();
}

// Private

const TARGET_TEMPERATURE_OFFSET = 0.2;
const REFRESH_STATUS_INTERVAL = 45 * 1000; // 45s
const REFRESH_STATUS_CHANGE_INTERVAL = 5 * 60 * 1000 // 5 minutes

let lastRefreshTimestamp = Number.MIN_VALUE;

async function getNewStatus() {
  // Get values
  const [thermostat, awayValue] = await Promise.all([
    thermostatModel.get(),
    usersModel.getStoredAwayValueForAll(),
  ]);

  // Create new status
  if (awayValue === 'away') {
    logger.info('New status: off because users are away');
    return 'off';
  }

  if (thermostat.mode == 'warm') {
    const offsetTargetTemperature = thermostat.targetTemperature - TARGET_TEMPERATURE_OFFSET;
    const newStatus = thermostat.temperature <= offsetTargetTemperature ? 'on' : 'off';
    logger.info(`New status: ${newStatus}, temperature: ${thermostat.temperature}, targetTemperature: ${thermostat.targetTemperature}, mode: warm`);
    return newStatus;
  }
  else {
    const offsetTargetTemperature = thermostat.targetTemperature + TARGET_TEMPERATURE_OFFSET;
    const newStatus = thermostat.temperature >= offsetTargetTemperature ? 'on' : 'off';
    logger.info(`New status: ${newStatus}, temperature: ${thermostat.temperature}, targetTemperature: ${thermostat.targetTemperature}, mode: cold`);
    return newStatus;
  }
}