var Utils = require('./utils');
var Client = require('./client');
var Protocol = require('../client/protocol');

var Engine = function(config, serverName) {
  this._name = serverName;
  this._config = config;
  this._clients = {};
  this._timers = {};
  this._queues = {};

  for(var queue in this._config[serverName].queues) {
    var queueConfig = this._config[serverName].queues[queue];
    var Queue = require('./queues/' + queueConfig.name);
    this._queues[queueConfig.name] = new Queue(this, queueConfig);
  }
};

module.exports = Engine;

Engine.prototype.createClient = function() {
  var clientId = Utils.random();
  while (this._clients.hasOwnProperty(clientId))
    clientId = Utils.random();

  this._clients[clientId] = new Client(clientId);
  this.updateTimer(clientId);

  return clientId;
};

Engine.prototype.receive = function(clientId, callback, scope) {
  if(!this.clientExist(clientId)) {
    return Protocol.createReceiveResponseMessage(clientId, null, Protocol.CLIENT_NOT_EXIST, null);
  }

  this._clients[clientId].setReceiveRequest(callback, scope);
  this.updateTimer(clientId);
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

Engine.prototype.updateTimer = function(clientId) {
  var timeoutId = this._timers[clientId];
  var self = this;
  var timerFunction = function() { self.deleteClient(clientId); };

  if(timeoutId !== null) {
    clearTimeout(timeoutId);
  }

  this._timers[clientId] = setTimeout(timerFunction, 30000, clientId);
};

Engine.prototype.subscribe = function(clientId, queue, params) {
  if(!this.clientExist(clientId)) {
    return [Protocol.CLIENT_NOT_EXIST, null];
  }
  if(!(queue in this._queues)) {
    return [Protocol.QUEUE_NOT_FOUND, null];
  }

  return this._queues[queue].subscribe(this._clients[clientId], params);
};