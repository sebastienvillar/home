const winston = require('winston');
const loggerUtils = require('./loggerUtils');

// Public

module.exports = winston.createLogger({
  format: loggerUtils.htmlFormat,
});