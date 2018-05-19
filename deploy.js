const forever = require('forever-monitor');
const fs = require('fs');
const config = require('./config');
const nodemailer = require('nodemailer');

const REDIS_OUT_FILE = './logs/redis-stdout.log'
const REDIS_ERR_FILE = './logs/redis-stderr.log'
const SERVER_OUT_FILE = './logs/server-stdout.log'
const SERVER_ERR_FILE = './logs/server-stderr.log'

function start() {
  createLogDirectory();

  const redis = new (forever.Monitor)(['redis-server', './redis.conf'], {
    silent: false,
    killTree: true,
    outFile: REDIS_OUT_FILE,
    errFile: REDIS_ERR_FILE,
    sourceDir: './',
  });

  redis.on('error', () => {
    sendEmail('Redis error');
  });

  redis.on('stderr', () => {
    sendEmail('Redis error');
  });

  redis.on('restart', () => {
    sendEmail('Redis crash');
  });

  redis.start();

  const server = new (forever.Monitor)('./src/index.js', {
    silent: false,
    killTree: true,
    outFile: SERVER_OUT_FILE,
    errFile: SERVER_ERR_FILE,
  });

  server.on('error', () => {
    sendEmail('HTTP server error');
  });

  server.on('stderr', () => {
    sendEmail('HTTP server error');
  });

  server.on('restart', () => {
    sendEmail('HTTP server crash');
  });

  server.start();
}

function createLogDirectory() {
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
  }
}

function sendEmail(text) {
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
    text: text,
    attachments: [
      {
        path: REDIS_OUT_FILE,
      },
      {
        path: REDIS_ERR_FILE,
      },
      {
        path: SERVER_OUT_FILE,
      },
      {
        path: SERVER_ERR_FILE,
      }
    ]
  }

  transporter.sendMail(message, (err) => {
    if (err) {
      console.log(`Could not send email: ${err}`);
    }
  })
}

start();