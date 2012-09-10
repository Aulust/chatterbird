var fs = require('fs');
var util = require("util");
var events = require("events");

/*
 * This is special queue with access to server internals
 */
var Admin = function(config) {
    this._config = config;
    this._clients = {};

    this.on('subscribe', this.subscribe.bind(this));
    this.on('unsubscribe', this.unsubscribe.bind(this));

    setInterval(this._publishInfo.bind(this), 4000);
};

module.exports = Admin;

util.inherits(Admin, events.EventEmitter);

Admin.prototype._getSystemData = function() {
  /*var writeToFiles = function() {
    var data = Object.keys(self.engine._clients).length;

    var stream = fs.createWriteStream(self._config.statFile);
    stream.once('open', function() {
      stream.write(data);
    });
  };*/

  //setInterval(writeToFiles, 120000);
};

Admin.prototype.subscribe = function(clientId) {
    this._clients[clientId] = '';
};

Admin.prototype.unsubscribe = function(clientId) {
    delete this._clients[clientId];
};

Admin.prototype._publishInfo = function() {
    var data = {
        'sessions': Object.keys(this._transport._sessions),
        'queues': Object.keys(this._engine._queues),
        'clientsInfo': this._engine._clientQueues
    };

    this.emit('publish', this._clients, data);
};
