const logger = require('../logger');
const config = require('../../../config');
const request = require('../request');

const TIMEOUT = 20000; // 20 seconds

exports.getAll = async function() {
  try {
    return await request({
      method: 'GET',
      uri: `http://${config.hueIP}/api/${config.hueUsername}/groups`,
      timeout: TIMEOUT,
      json: true,
    });
  } catch(e) {
    logger.error(`Could not get lights: ${e}`);
    throw e;
  }
}

exports.setStatus = async function(id, status) {
  try {
    await request({
      method: 'PUT',
      uri: `http://${config.hueIP}/api/${config.hueUsername}/groups/${id}/action`,
      timeout: TIMEOUT,
      body: { on: status === 'on' },
      json: true,
    });
  } catch (e) {
    logger.error(`Could not set light status with ID: ${id}, to: ${status} - ${e}`);
    throw e;
  }
}