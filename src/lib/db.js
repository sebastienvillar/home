const redis = require('redis-promisify');

module.exports = redis.createClient();