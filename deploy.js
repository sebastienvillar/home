const forever = require('forever-monitor');
const fs = require('fs');
const config = require('./config');


function start() {
  // Start server
  const server = new (forever.Monitor)('./src/index.js', {
    silent: false,
    killTree: true,
    minUptime: 10000,
    spinSleepTime: 10000,
  });

  server.start();
}

start();