const winston = require('winston');
const logger = require('../../lib/logger');
const config = require('../../../config');
const Constants = require('../../lib/constants');
const moment = require('moment-timezone');
const Transport = require('winston-transport');
const nodemailer = require('nodemailer');
const logsModel = require('./model');
const loggerUtils = require('../../lib/loggerUtils');

// Public

exports.init = async function () {
  // Nothing to do
}

// Private

class EmailTransport extends Transport {
  constructor(options) {
    super(options);
    this.subject = options.subject;
  }

  log(info, callback) {
    this.sendEmail();
    callback();
  }

  sendEmail() {
    const content = logsModel.get().text;
    const transporter = nodemailer.createTransport({
      host: config.contactSmtp,
      port: 465,
      secure: true,
      auth: {
        user: config.contactUsername,
        pass: config.contactPassword,
      }
    });

    const message = {
      to: [config.contactEmail],
      subject: this.subject,
      attachments: [
        {
          filename: 'log.html',
          content: content,
          contentType: 'text/html; charset=utf-8',
        },
      ]
    }

    transporter.sendMail(message, (err) => {
      if (err) {
        console.error(`Could not send email: ${err}`);
      }
    })
  }
};

// Private
// This needs to be done before anything else
const LOG_MAX_SIZE = 5 * 1024 * 1024 // 5 MB

// Handle exceptions
logger.exceptions.handle(
  new winston.transports.File({ filename: Constants.LOG_PATH, maxsize: LOG_MAX_SIZE, maxFiles: 2, tailable: true }),
  new EmailTransport({ subject: 'Home server exception' }),
);

// Handle errors
logger.add(
  new winston.transports.File({ filename: Constants.LOG_PATH, maxsize: LOG_MAX_SIZE, maxFiles: 2, tailable: true }),
  new EmailTransport({ level: 'error', subject: 'Home server error' }),
);

// If not in production, log in console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: loggerUtils.consoleFormat,
  }));
}