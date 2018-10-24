const config = require('../../config');
const Constants = require('./constants');
const winston = require('winston');
const moment = require('moment-timezone');
const Transport = require('winston-transport');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Private

const LOG_MAX_SIZE = 5 * 1024 * 1024 // 5 MB

const timestampFormat = winston.format((info, opts) => {
  if (opts.tz)
    info.timestamp = moment().tz(opts.tz).format();
  return info;
});

const format = winston.format.combine(
  timestampFormat({tz: "America/New_York"}),
  winston.format.printf(info => {
    return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
  }),
);

class EmailTransport extends Transport {
  log(info, callback) {
    this.sendEmail();
    callback();
  }

  sendEmail() {
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
      subject: "Home error",
      attachments: [
        {
          path: Constants.LOG_PATH,
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

// Public

module.exports = (() => {
  const logger = winston.createLogger({
    format: format,
    transports: [
      new winston.transports.File({ filename: Constants.LOG_PATH, maxsize: LOG_MAX_SIZE, maxFiles: 2, tailable: true }),
      new EmailTransport({ level: 'error' }), 
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: Constants.LOG_PATH, maxsize: LOG_MAX_SIZE, maxFiles: 2, tailable: true }),
      new EmailTransport(), 
    ]
  });

  // If not in production, log in console as well
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: format,
    }));
  }

  return logger;
})();