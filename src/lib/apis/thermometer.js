const PythonShell = require('python-shell');
const { promisify } = require('util');
const runAsync = promisify(PythonShell.run).bind(PythonShell);

exports.read = async function(pin, retries) {
  const options = {
    mode: 'json',
    scriptPath: 'src/lib/devices/thermometer/',
    args: [pin, retries]
  };

  return runAsync('main.py', options).then((result) => {
    if (!result || !result[0]) {
      console.error(`Invalid data from thermometer: ${result}`)
      return undefined;
    }

    return result[0].temperature;
  });
}