const Constants = require('../../lib/constants');
const fs = require('fs');

// Public

// Model
// string

exports.init = async function () {
  // Nothing to do
}

// Mix

exports.get = async function () {
  const file1 = fs.existsSync(Constants.LOG_PATH) ? fs.readFileSync(Constants.LOG_PATH, 'utf8') : '';
  const file2 = fs.existsSync(Constants.LOG_PATH_ROTATED) ? fs.readFileSync(Constants.LOG_PATH_ROTATED, 'utf8') : '';
  let body = file2 + file1;
  body = body.split('\n').reverse().join('\n');
  const head = '<head><meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1"></head>'
  return {
    text: `<html>${head}<body>${body}</body></html>`,
  };
}