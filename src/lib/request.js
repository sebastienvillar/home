const logger = require('./logger');
const requestPromise = require('request-promise');
const url = require('url');

// Public

module.exports = async function() {
  const timestamp1 = Date.now();
  return requestPromise.apply(requestPromise, arguments).then((result) => {
    const timestamp2 = Date.now();
    const timeDiff = timestamp2 - timestamp1
    if (timeDiff > THRESHOLD) {
      const path = url.parse(arguments[0].uri);
      logger.warn(`Too long request for "${path.host}": ${timeDiff} ms`);
    }

    return result
  });
}

// Private

const THRESHOLD = 250;