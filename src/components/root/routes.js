const rootModel = require('./model');

module.exports = {
  '/': {
    get: get,
  },
}

async function get(req, res) {
  // Get arguments
  if (!req.query.id) {
    res.sendStatus(400);
    return;
  }

  const userId = req.query.id;

  try {
    // Send result
    const result = await rootModel.get(userId);
    res.status(200).send(result);
  } catch(e) {
    res.status(500).send({
      message: e.message,
    });
  }
}