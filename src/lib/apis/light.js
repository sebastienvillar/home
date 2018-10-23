const logger = require('../logger');
const config = require('../../../config');
const request = require('../request');

// Public

exports.getAll = async function() {
  try {
    const result = await request({
      method: 'GET',
      uri: `http://${config.hueIP}/api/${config.hueUsername}/groups`,
      timeout: TIMEOUT,
      json: true,
      resolveWithFullResponse: true,
    });

    logger.info(`Get all success: ${result.statusCode}, body: ${JSON.stringify(result.body)}`);
    return result.body
  } catch(e) {
    logger.error(`Could not get lights: ${e}`);
    throw e;
  }
}

exports.setAttributes = async function(ids, attributes) {
  const body = {};
  if (attributes.status) {
    body.on = attributes.status === 'on';
  }
  if (attributes.brightness) {
    body.bri = attributes.brightness;
  }

  try {
    const promises = ids.map((id) => {
      return request({
        method: 'PUT',
        uri: `http://${config.hueIP}/api/${config.hueUsername}/lights/${id}/state`,
        timeout: TIMEOUT,
        body: body,
        json: true,
        resolveWithFullResponse: true,
      });
    });

    await Promise.all(promises);
    logger.info(`Set attributes success: ${ids}, attributes: ${attributes}`);
  } catch (e) {
    logger.error(`Could not set light attributes with ID: ${id}, to: ${attributes} - ${e}`);
    throw e;
  }
}

// Private

const TIMEOUT = 20000; // 20 seconds