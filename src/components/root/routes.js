const manager = require('./manager');

module.exports = {
  '/': {
    get: get,
  },
}

async function get(req, res) {
  if (!req.query.id) {
    res.sendStatus(400);
    return;
  }

  const id = req.query.id;
  const result = await manager.get(id);
  res.status(200).send(result);
}