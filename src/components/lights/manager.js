const lightsModel = require('./model');
const usersModel = require('../users/model');

// Public

exports.init = async function () {
  // Nothing to do
}

exports.refresh = async function () {
  const awayValue = await usersModel.getStoredAwayValueForAll();
  if (awayValue === 'away') {
    console.log('Turn off all light because users are now away');
    await lightsModel.setRemoteStatusForAll('off');
  }
  else {
    console.log('Turn on all light because users are now home');
    await lightsModel.setRemoteStatusForAll('on');
  }
}
