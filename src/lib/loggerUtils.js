const winston = require('winston');
const moment = require('moment-timezone');

// Private

const timestampFormat = winston.format((info, opts) => {
  if (opts.tz)
    info.timestamp = moment().tz(opts.tz).format();
  return info;
});

exports.htmlFormat = winston.format.combine(
  timestampFormat({ tz: "America/New_York" }),
  winston.format.printf(info => {
    const color = (() => {
      switch (info.level) {
        case 'error':
          return 'red';
        case 'warn':
          return 'orange';
        default:
          return 'black';
      }
    })()

    return `<div style="color: ${color}">${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}</div>`;
  }),
);

exports.consoleFormat = winston.format.combine(
  timestampFormat({ tz: "America/New_York" }),
  winston.format.printf(info => {
    return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
  }),
);