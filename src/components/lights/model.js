const lightApi = require('../../lib/apis/light');

// Public

// Model
// {
//   id: string <remote>,
//   name: string <remote>,
//   status: string (on/off) <remote>, - attribute
//   brightness: number (1-254) <remote> - attribute
// }

exports.init = async function() {
  // Nothing to do
}

// Mix

exports.getAll = async function() {
  const hueLights = await lightApi.getAll();
  return Object.keys(hueLights).map((id) => {
    const hueLight = hueLights[id];
    
    return {
      id: id,
      name: hueLight.name,
      status: hueLight.state.all_on ? 'on' : 'off',
      brightness: hueLight.action.bri,
    };
  });
}

// Remote

exports.setRemoteAttributesForAll = async function(attributes) {
  const hueLights = await lightApi.getAll();
  const promises = Object.keys(hueLights).map(id => exports.setRemoteAttributes(id, attributes));
  return Promise.all(promises);
}

exports.setRemoteAttributes = async function(id, attributes) {
  return lightApi.setAttributes(id, attributes);
}