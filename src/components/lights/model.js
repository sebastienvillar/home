const lightApi = require('../../lib/apis/light');

// Public

// Model
// {
//   id: string <remote>,
//   name: string <remote>,
//   status: string (on/off) <remote>,
// }

exports.init = async function() {
  // Nothing to do
}

// Mix

exports.getAll = async function() {
  const hueLights = await lightApi.getAll();
  return Object.keys(hueLights).map((id) => {
    return {
      id: id,
      name: hueLights[id].name,
      status: hueLights[id].state.all_on ? 'on' : 'off',
    };
  });
}

// Remote

exports.setRemoteStatusForAll = async function(status) {
  const hueLights = await lightApi.getAll();
  const promises = Object.keys(hueLights).map(id => exports.setRemoteStatus(id, status));
  return Promise.all(promises);
}

exports.setRemoteStatus = async function(id, status) {
  return lightApi.setStatus(id, status);
}