const request = require('request-promise');
const TIMEOUT = 20000; // 20 seconds

exports.getAll = async function (ip, username) {
  return request({
    method: 'GET',
    uri: `http://${ip}/api/${username}/groups`,
    timeout: TIMEOUT,
    json: true,
  }).then((json) => {
    return json;
  }).catch((e) => {
    console.log(`Could not get lights: ${e}`);
    return null;
  });
}

exports.turnOn = async function (ip, username, id) {
  return request({
    method: 'PUT',
    uri: `http://${ip}/api/${username}/groups/${id}/action`,
    timeout: TIMEOUT,
    body: { on: true },
    json: true,
  }).then(() => {
    return 'success';
  }).catch((e) => {
    console.log(`Could not turn on light with ID: ${id} - ${e}`);
    return 'failure';
  });
}

exports.turnOff = async function (ip, username, id) {
  return request({
    method: 'PUT',
    uri: `http://${ip}/api/${username}/groups/${id}/action`,
    timeout: TIMEOUT,
    body: { on: false },
    json: true,
  }).then(() => {
    return 'success';
  }).catch((e) => {
    console.log(`Could not turn off light with ID: ${id} - ${e}`);
    return 'failure';
  });
}