const redis = require('redis-promisify');
const flatten = require('array-flatten');
const db = redis.createClient();

// Public

exports.onReady = (callback) => {
  db.on('ready', callback);
}

// Get

exports.smembersAsync = db.smembersAsync.bind(db);

exports.getAsync = db.getAsync.bind(db);

exports.getAllAsync = async function(keys) {
  // Fetch values
  let batchFetch = db.multi();
  keys.forEach(key => batchFetch = batchFetch.get(key));
  let values;
  try {
    values = await batchFetch.execAsync();
  }
  catch (e) {
    console.error(`getAllAsync error: ${e}`);
    return Promise.reject();
  }

  return keys.reduce((acc, key, index) => {
    acc[key] = values[index];
    return acc;
  }, {});
}

// Set

exports.saddAsync = async function(key, value) {
  await db.saddAsync(key, value);
  return triggerKeysChange([key]);
}

exports.setAsync = async function(key, value) {
  await db.setAsync(key, value);
  return triggerKeysChange([key]);
}

exports.setAllIfNotExistAsync = async function (keyToValues) {
  // Fetch values
  let batchFetch = db.multi();
  const keys = Object.keys(keyToValues);
  keys.forEach(key => batchFetch = batchFetch.get(key));
  let values;

  try {
    values = await batchFetch.execAsync();
  }
  catch (e) {
    console.error(`setAllIfNotExistAsync error: ${e}`);
    return Promise.reject();
  }

  // Set if null
  let hasValues = false;
  let batchSet = db.multi();
  values.forEach((value, index) => {
    if (value === null) {
      hasValues = true
      batchSet = batchSet.set(keys[index], keyToValues[keys[index]]);
    }
  });

  if (!hasValues) {
    return Promise.resolve();
  }

  try {
    await batchSet.execAsync();
    return triggerKeysChange(keys);
  }
  catch (e) {
    console.error(`setAllIfNotExistAsync error: ${e}`);
    return Promise.reject();
  }
}

exports.setAllAsync = async function (keyToValue) {
  let batchSet = db.multi();
  for (const key in keyToValue) {
    batchSet = batchSet.set(key, keyToValue[key]);
  }

  try {
    await batchSet.execAsync();
    return triggerKeysChange(Object.keys(keyToValue));
  }
  catch (e) {
    console.error(`setAllAsync error: ${e}`);
    return Promise.reject();
  }
}

exports.onKeysChange = function(keys, callback) {
  keys.forEach((key) => {
    const callbacks = patternToCallbacks[key] || [];
    callbacks.push(callback);
    patternToCallbacks[key] = callbacks;
  });
};

// Private

const patternToCallbacks = {};

async function triggerKeysChange(keys) {
  // Find callbacks
  let callbacks = keys.map((key) => {
    const patterns = Object.keys(patternToCallbacks)
    return patterns.reduce((result, pattern) => {
      if (new RegExp(pattern).test(key)) {
        result.push(patternToCallbacks[pattern]);
      }
      return result;
    }, [])
  });

  // Flatten array
  callbacks = flatten(callbacks);

  // Remove duplicates
  callbacks = callbacks.reduce((result, callback) => {
    if (result.indexOf(callback) === -1) {
      result.push(callback);
    }
    return result;
  }, []);

  const promises = callbacks.map(c => c());
  return Promise.all(promises);
}
