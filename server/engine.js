var util = require("util");
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
    this.initQueue(Queue, queueConfig.name, this);

    this._queues[queueConfig.name] = new Queue(queueConfig);
  }
};

module.exports = Engine;

Engine.prototype.initQueue = function(Queue, queueName, engine) {
  var queueModule = require('./modules/queue');

  for (var method in queueModule.prototype) {
    Queue.prototype[method] = queueModule.prototype[method];
  }

  Queue.prototype._queueName = queueName;
  Queue.prototype._engine = engine;
};

Engine.prototype.createClient = function(clientId, connection) {
  this._clients[clientId] = new Client(clientId, connection);
};

Engine.prototype.getClient = function(clientId) {
  return this._clients[clientId];
};

Engine.prototype.deleteClient = function(clientId) {
  if(!this.clientExist(clientId)) {
    return;
  }

  for(var queue in this._queues) {
    this._queues[queue].unsubscribe(clientId);
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

  return this._queues[queue].subscribe(clientId, params);
};