const logger = require('../logger');
const config = require('../../../config');
const request = require('request-promise');

const TIMEOUT = 20000; // 20 seconds

exports.getStatus = async function() {
  try {
    return await request({
      method: 'GET',
      uri: `http://${config.thermostatSwitchIP}/status`,
      timeout: TIMEOUT,
    });
  } catch (e) {
    logger.error(`Could not get switch status - ${e}`);
    throw e;
  }
}

exports.setStatus = async function(status) {
  try {
    await request({
      method: 'GET',
      uri: `http://${config.thermostatSwitchIP}/${status}`,
      timeout: TIMEOUT,
    });
  } catch(e) {
    logger.error(`Could not set switch status to: ${status} - ${e}`);
    throw e;
  }
}