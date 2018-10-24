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
  groupIdToLightIds = groupIdToLightIds || {};
  const groups = [];

  Object.keys(hueLights).forEach(id => {
    const hueLight = hueLights[id];
    groupIdToLightIds[id] = hueLight.lights;
    groups.push({
      id: id,
      name: hueLight.name,
      status: hueLight.state.all_on ? 'on' : 'off',
      brightness: hueLight.action.bri,
    });
  });

  return groups;
}

// Remote

exports.setRemoteAttributesForAll = async function(attributes) {
  const groups = await exports.getAll();
  const promises = groups.map(group => exports.setRemoteAttributes(group.id, attributes));
  return Promise.all(promises);
}

exports.setRemoteAttributes = async function(id, attributes) {
  if (!groupIdToLightIds || Object.keys(groupIdToLightIds).length === 0) {
    await exports.getAll();
  }

  const lightIds = groupIdToLightIds[id];
  if (!lightIds) {
    return;
  }

  return lightApi.setAttributes(lightIds, attributes);
}

// Private

groupIdToLightIds = null;