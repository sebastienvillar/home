const redis = require('redis');
const { promisify } = require('util');
const dbChangeEmitter = require('./dbChangeEmitter');
const { dbChangeEvent } = require('./constants');

// Private
const client = redis.createClient();
const asyncSet = promisify(client.set).bind(client);
const asyncHmset = promisify(client.hmset).bind(client);
const asyncHset = promisify(client.hset).bind(client);
const asyncSadd = promisify(client.sadd).bind(client);

// Public
exports.exists = promisify(client.exists).bind(client);

// String
exports.get = promisify(client.get).bind(client);
exports.set = async (key, value) => {
  return asyncSet(key, value).then((result) => {
    dbChangeEmitter.emit(dbChangeEmitter.changeEvent, key);
    return result;
  });
}

// Hash
exports.hgetall = promisify(client.hgetall).bind(client);
exports.hget = promisify(client.hget).bind(client);

exports.hmset = async (key, value) => {
  return asyncHmset(key, value).then((result) => {
    dbChangeEmitter.emit(dbChangeEmitter.changeEvent, key);
    return result;
  });
}
exports.hset = async (key, field, value) => {
  return asyncHset(key, field, value).then((result) => {
    dbChangeEmitter.emit(dbChangeEmitter.changeEvent, `${key}.${field}`);
    return result;
  });
}

// Set
exports.smembers = promisify(client.smembers).bind(client);
exports.sadd = async (key, value) => {
  return asyncSadd(key, value).then((result) => {
    dbChangeEmitter.emit(dbChangeEmitter.changeEvent, key);
    return result;
  });
}
