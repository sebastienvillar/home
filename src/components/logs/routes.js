const logsModel = require('../logs/model');

module.exports = {
  '/logs/': {
    get: get,
  },
}

async function get(req, res) {
  try {
    // Send result
    const result = await logsModel.get();
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send({
      message: e.message,
    });
  }
}