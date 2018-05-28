const express = require('express');
const bodyParser = require('body-parser');
const db = require('./lib/db');
const dbListener = require('./lib/dbListener');
const rootRoutes = require('./components/root/routes');
const rootManager = require('./components/root/manager');
const thermostatRoutes = require('./components/thermostat/routes');
const thermostatManager = require('./components/thermostat/manager');
const usersRoutes = require('./components/users/routes');
const usersManager = require('./components/users/manager');
const lightsRoutes = require('./components/lights/routes');
const lightsManager = require('./components/lights/manager');
const morgan = require('morgan');
const requestId = require('express-request-id');

async function init() {
  // Init db and listener
  await new Promise((resolve, reject) => {
    db.on('ready', () => {
      resolve()
    });
  });
  await dbListener.init();
  
  // Init managers
  rootManager.init();
  thermostatManager.init()
  usersManager.init();
  lightsManager.init();

  // Create app
  const app = express();
  app.use(morgan('tiny'));
  app.use(requestId());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Create routes
  const mainRoutes = [rootRoutes, thermostatRoutes, usersRoutes, lightsRoutes];
  mainRoutes.forEach(routes => {
    for (route in routes) {
      const methodHash = routes[route];
      for (methodKey in methodHash) {
        const methodFunction = methodHash[methodKey];
        app[methodKey](route, methodFunction);
      }
    }
  });

  // Start
  const port = process.env.PORT || 8080;
  app.listen(port);
  console.log(`App listening on port ${port}`);
}

init();