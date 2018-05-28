exports.Keys = {
  thermostat: {
    temperature: 'thermostatTemperature',
    targetTemperature: 'thermostatTargetTemperature',
    mode: 'thermostatMode',
    status: 'thermostatStatus',
  },
  userIds: 'userIds',
  user: {
    id: 'user-%s-id',
    awayMethod: 'user-%s-awayMethod',
    awayValue: 'user-%s-awayValue',
  },
  lightIds: 'lightIds',
  light: {
    id: 'light-%s-id',
    name: 'light-%s-name',
    status: 'light-%s-status',
  },
};

exports.ThermostatMode = {
  warm: 'warm',
  cool: 'cool',
};

exports.ThermostatStatus = {
  off: 'off',
  on: 'on',
};

exports.UserAwayMethod = {
  auto: 'auto',
  manual: 'manual',
};

exports.UserAwayValue = {
  away: 'away',
  home: 'home',
};

exports.LightStatus = {
  off: 'off',
  on: 'on',
};