var fs = require('fs');

var Admin = function(engine, config) {
  this._engine = engine;
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

    for(var client in self._clients) {
      self._clients[client].addMessage('admin', data);
    }
  };

  var writeToFiles = function() {
    var data = Object.keys(self._engine._clients).length;

    var stream = fs.createWriteStream("/tmp/nodestat");
    stream.once('open', function(fd) {
      stream.write(data);
    });
  };

  setInterval(timerFunction, 4000);
  setInterval(writeToFiles, 120000);
};

Admin.prototype.subscribe = function(client, params) {
  this._clients[client.id] = client;

  return [200, null];
};

Admin.prototype.unsubscribe = function(client) {
  delete this._clients[client.id];
};