const logger = require('../../lib/logger');
const thermostatModel = require('./model');
const usersModel = require('../users/model');

const TARGET_TEMPERATURE_OFFSET = 0.5;
const REFRESH_STATUS_INTERVAL = 45 * 1000; // 45s

// Public

exports.init = async function() {
  // Start status refreshes
  setInterval(async () => {
    try {
      await exports.refresh();
    } catch(e) {}
  }, REFRESH_STATUS_INTERVAL);
}

exports.refresh = async function () {
  // Refresh temperature
  await thermostatModel.getRemoteTemperature();
  
  // Get values
  const [thermostat, awayValue] = await Promise.all([
    thermostatModel.get(),
    usersModel.getStoredAwayValueForAll(),
  ]);

  // Create new status
  const newStatus = (() => {
    if (awayValue === 'away') {
      return 'off';
    }

    if (thermostat.mode == 'warm') {
      const offsetTargetTemperature = thermostat.targetTemperature - TARGET_TEMPERATURE_OFFSET;
      if (thermostat.status === 'on') {
        // Keep going until we're at target temperature
        return thermostat.temperature < thermostat.targetTemperature ? 'on' : 'off';
      }
      else {
        // Trigger only if lower than offsetTargetTemperature
        return thermostat.temperature < offsetTargetTemperature ? 'on' : 'off';
      }
    }
    else {
      const offsetTargetTemperature = thermostat.targetTemperature + TARGET_TEMPERATURE_OFFSET;
      if (thermostat.status === 'on') {
        // Keep going until we're at target temperature
        return thermostat.temperature > thermostat.targetTemperature ? 'on' : 'off';
      }
      else {
        // Trigger only if higher than offsetTargetTemperature
        return thermostat.temperature > thermostat.offsetTargetTemperature ? 'on' : 'off';
      }
    }
  })();

  // Update status
  if (newStatus !== thermostat.status) {
    logger.info(`Update thermostat status: ${newStatus} for temperature: ${thermostat.temperature}, targetTemperature: ${thermostat.targetTemperature}, mode: "${thermostat.mode}", awayValue: "${awayValue}", oldStatus: ${thermostat.status}`);
    await thermostatModel.setRemoteStatus(newStatus);
  }
}
