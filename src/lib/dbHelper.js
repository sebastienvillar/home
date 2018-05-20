const db = require('./db');

exports.setAllIfNotExistAsync = async function(keyToValues) {
  // Fetch values
  let batchFetch = db.multi();
  const keys = Object.keys(keyToValues);
  keys.forEach(key => batchFetch = batchFetch.get(key));
  let values;

  try {
    values = await batchFetch.execAsync();
  }
  catch(e) {
    console.error(`setAllIfNotExistAsync error: ${e}`);
    return Promise.reject();
  }

  // Set if null
  let batchSet = db.multi();
  values.forEach((value, index) => {
    if (value === null) {
      batchSet = batchSet.set(keys[index], keyToValues[keys[index]]);
    }
  });

  try {
    await batchSet.execAsync();
  }
  catch(e) {
    console.error(`setAllIfNotExistAsync error: ${e}`);
    return Promise.reject();
  }

  return Promise.resolve();
}

exports.setAllAsync = async function(keyToValue) {
  let batchSet = db.multi();
  for (const key in keyToValue) {
    batchSet = batchSet.set(key, keyToValue[key]);
  }

  try {
    await batchSet.execAsync();
  }
  catch (e) {
    console.error(`setAllAsync error: ${e}`);
    return Promise.reject();
  }

  return Promise.resolve();
}

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