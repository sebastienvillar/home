const EventEmitter = require('events');

class DbChangeEmitter extends EventEmitter { 

}

DbChangeEmitter.changeEvent = 'change';

module.exports = new DbChangeEmitter();