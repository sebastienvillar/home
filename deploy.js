const forever = require('forever-monitor');
const fs = require('fs');

if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

const redis = new (forever.Monitor)(['redis-server', './redis.conf'], {
  silent: false,
  killTree: true,
  outFile: './logs/redis-stdout.log',
  errFile: './logs/redis-stderr.log',
  sourceDir: './',
});

redis.start();

const server = new (forever.Monitor)('./src/index.js', {
  silent: false,
  killTree: true,
  outFile: './logs/server-stdout.log',
  errFile: './logs/server-stderr.log',
});

server.start();