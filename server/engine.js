var Client = require('./client');
var Protocol = require('../client/protocol');

var Engine = function(config, serverName) {
  this._name = serverName;
  this._config = config;
  this._clients = {};
  this._queues = {};

  for(var queue in this._config[serverName].queues) {
    var queueConfig = this._config[serverName].queues[queue];
    var Queue = require('./queues/' + queueConfig.name);
    this._queues[queueConfig.name] = new Queue(this, queueConfig);
  }
};

module.exports = Engine;

Engine.prototype.createClient = function(clientId, connection) {
  this._clients[clientId] = new Client(clientId, connection);
};

Engine.prototype.deleteClient = function(clientId) {
  if(!this.clientExist(clientId)) {
    return;
  }

  for(var queue in this._queues) {
    this._queues[queue].unsubscribe(this._clients[clientId]);
  }

  this._clients[clientId]._delete();

  delete this._clients[clientId];
};

Engine.prototype.clientExist = function(clientId) {
  return this._clients.hasOwnProperty(clientId);
};

Engine.prototype.subscribe = function(clientId, queue, params) {
  if(!(queue in this._queues)) {
    return [Protocol.QUEUE_NOT_FOUND, null];
  }

  return this._queues[queue].subscribe(this._clients[clientId], params);
};