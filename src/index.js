const express = require('express');
const bodyParser = require('body-parser');
const thermostatRoute = require('./components/thermostat/route');
const thermostatManager = require('./components/thermostat/manager');

// Init managers
thermostatManager.init()

// Create app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Create routes
app.get(thermostatRoute.route, thermostatRoute.get);
app.patch(thermostatRoute.route, thermostatRoute.patch);

// Start
const port = process.env.PORT || 8080;
app.listen(port);
console.log(`App listening on port ${port}`);