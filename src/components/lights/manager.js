const logger = require('../../lib/logger');
const lightsModel = require('./model');
const usersModel = require('../users/model');

// Public

exports.init = async function () {
  // Nothing to do
}

exports.refresh = async function () {
  const awayValue = await usersModel.getStoredAwayValueForAll();
  if (awayValue === 'away') {
    logger.info('Turn off all light because users are now away');
    await lightsModel.setRemoteStatusForAll('off');
  }
  else {
    logger.info('Turn on all light because users are now home');
    await lightsModel.setRemoteStatusForAll('on');
  }
}
