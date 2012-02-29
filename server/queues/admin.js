var fs = require('fs');

var Admin = function(config) {
  this._config = config;
  this._clients = {};

  this._getSystemData();
};

module.exports = Admin;

Admin.prototype._getSystemData = function() {
  var self = this;
  var timerFunction = function() {
    var data = {
      'name': self._engine._name,
      'connectedClients': Object.keys(self._engine._clients).length,
      'queues': Object.keys(self._engine._queues)
    };

    self.deliverMessage(self._clients, data)
  };

  var writeToFiles = function() {
    var data = Object.keys(self._engine._clients).length;

    var stream = fs.createWriteStream(self._config.statFile);
    stream.once('open', function() {
      stream.write(data);
    });

    stream.end();
  };

  setInterval(timerFunction, 4000);
  setInterval(writeToFiles, 120000);
};

Admin.prototype.subscribe = function(clientId, params) {
  this._clients[clientId] = '';

  return [200, null];
};

Admin.prototype.unsubscribe = function(clientId) {
  delete this._clients[clientId];
};