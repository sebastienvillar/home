const redis = require('redis-promisify');

const subscriber = redis.createClient();

const channelMessageToCallback = {};
subscriber.on('pmessage', (pattern, channel, message) => {
  const channelMessage = `${pattern} ${message}`;
  if (channelMessageToCallback[channelMessage]) {
    channelMessageToCallback[channelMessage].forEach(callback => callback());
  }
});

// Public

exports.on = function(keys, callback) {
  const channels = keys.map(key => `__keyspace@0__:${key}`);
  const channelMessages = channels.map(channel => `${channel} set`);

  channels.forEach((channel, index) => {
    if (!channelMessageToCallback[channelMessages[index]]) {
      subscriber.psubscribe(channel);
      channelMessageToCallback[channelMessages[index]] = [];
    }

    channelMessageToCallback[channelMessages[index]].push(callback);
  });
};

exports.init = async function() {
  return new Promise((resolve, reject) => {
    subscriber.on('ready', () => {
      resolve();
    });
  });
};