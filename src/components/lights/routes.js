const rootModel = require('../root/model');
const lightsModel = require('./model');

module.exports = {
  '/lights/:id': {
    patch: patch,
  },
}

async function patch(req, res) {
  // Get arguments
  if (!req.query.id || !req.body || (req.body.status !== 'on' && req.body.status !== 'off')) {
    res.sendStatus(400);
    return;
  }

  const userId = req.query.id
  const lightId = req.params.id;

  try {
    // Set status
    await lightsModel.setRemoteStatus(lightId, req.body.status)

    // Send result
    const result = await rootModel.get(userId);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send({
      message: e.message,
    });
  }
}