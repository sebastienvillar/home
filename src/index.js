const logger = require('./lib/logger');
const db = require('./lib/db');
const models = require('./components/models');
const managers = require('./components/managers');
const routes = require('./components/routes');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const requestId = require('express-request-id');

async function init() {
  // Init db
  await db.init();

  // Init models
  for (const model of Object.values(models)) {
    await model.init();
  }

  // Init managers
  for (const manager of Object.values(managers)) {
    await manager.init();
  }

  // Create app
  const app = express();
  const morganStream = {
    write: function (message, encoding) {
      logger.info(message);
    }
  };
  app.use(morgan('tiny', { 'stream': morganStream }));
  app.use(requestId());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Create routes
  for (const route of Object.values(routes)) {
    for (const [path, methods] of Object.entries(route)) {
      for (const [method, imp] of Object.entries(methods)) {
        app[method](path, imp);
      }
    }
  }

  // Start
  const port = process.env.PORT || 8080;
  app.listen(port);
  logger.info(`App listening on port ${port}`);
}

init();