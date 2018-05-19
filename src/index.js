const express = require('express');
const bodyParser = require('body-parser');
const thermostatRoutes = require('./components/thermostat/routes');
const thermostatManager = require('./components/thermostat/manager');
const usersRoutes = require('./components/users/routes');
const usersManager = require('./components/users/manager');

// Init managers
thermostatManager.init()
usersManager.init();

// Create app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create routes
const mainRoutes = [thermostatRoutes, usersRoutes];
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