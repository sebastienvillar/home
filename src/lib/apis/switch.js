const request = require('request-promise');

const TIMEOUT = 20000; // 20 seconds

exports.turnOn = async function(ip) {
  return request({
    'method': 'GET',
    'uri': `http://${ip}/cm?cmnd=Power%20On`,
    'timeout': TIMEOUT,
  }).then(() => {
    return 'success';
  }).catch((e) => {
    console.log(`Could not turn on switch: ${e}`);
    return 'failure';
  });
}

exports.turnOff = async function(ip) {
  return request({
    'method': 'GET',
    'uri': `http://${ip}/cm?cmnd=Power%20Off`,
    'timeout': TIMEOUT,
  }).then(() => {
    return 'success';
  }).catch((e) => {
    console.log(`Could not turn off switch: ${e}`);
    return 'failure';
  });
}