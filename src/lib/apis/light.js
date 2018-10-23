const logger = require('../logger');
const config = require('../../../config');
const request = require('../request');

// Public

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

exports.setAttributes = async function(id, attributes) {
  const body = {};
  if (attributes.status) {
    body.on = attributes.status === 'on';
  }
  if (attributes.brightness) {
    body.bri = attributes.brightness;
  }

  try {
    await request({
      method: 'PUT',
      uri: `http://${config.hueIP}/api/${config.hueUsername}/groups/${id}/action`,
      timeout: TIMEOUT,
      body: body,
      json: true,
    });
  } catch (e) {
    logger.error(`Could not set light attributes with ID: ${id}, to: ${attributes} - ${e}`);
    throw e;
  }
}

// Private

const TIMEOUT = 20000; // 20 seconds