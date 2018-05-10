const redis = require('redis');
const { promisify } = require('util');
const dbChangeEmitter = require('./dbChangeEmitter');
const { dbChangeEvent } = require('./constants');

// Private
const client = redis.createClient();
const asyncSet = promisify(client.set).bind(client);
const asyncHmSet = promisify(client.hmset).bind(client);

// Public
exports.exists = promisify(client.exists).bind(client);

exports.get = promisify(client.get).bind(client);
exports.set = async (key, value) => {
  return asyncSet(key, value).then((result) => {
    dbChangeEmitter.emit(dbChangeEmitter.changeEvent, key, value);
    return result;
  });
}

exports.hgetall = promisify(client.hgetall).bind(client);
exports.hmset = async (key, value) => {
  return asyncHmSet(key, value).then((result) => {
    dbChangeEmitter.emit(dbChangeEmitter.changeEvent, key, value);
    return result;
  });
}
