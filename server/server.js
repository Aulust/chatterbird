var Engine = require('./engine');
var Protocol = require('../client/protocol');

var Server = function(config, serverName) {
  this._engine = new Engine(config, serverName);
};

module.exports = Server;

Server.prototype.process = function(messages, callback, scope) {
  if (messages.length === 0) return callback.call(scope, []);
  var processed = 0, responses = [], self = this;

  var gatherReplies = function(reply) {
    responses = responses.concat(reply);
    processed += 1;
    if (processed < messages.length) return;

    callback.call(scope, JSON.stringify(responses));
  };

  var getResponse = function(reply) {
    callback.call(scope, reply);
  };

  if(messages.length === 1 && messages[0].action === 'receive') {
    this._handle(messages[0], getResponse, this);
  } else {
    for (var i = 0, n = messages.length; i < n; i++) {
      this._handle(messages[i], gatherReplies, this);
    }
  }
};

Server.prototype._handle = function(message, callback, scope) {
  var action = message.action;

  if(action === 'connect')
    this.connect(callback, scope);
  if(action === 'subscribe')
    this.subscribe(message.id, message.queue, message.params, callback, scope);
  if(action === 'receive')
    this.receive(message.id, callback, scope);
};

Server.prototype.connect = function(callback, scope) {
  var clientId = this._engine.createClient();
  callback.call(scope, [Protocol.createConnectResponseMessage(clientId)]);
};

Server.prototype.subscribe = function(clientId, queue, params, callback, scope) {
  var result = this._engine.subscribe(clientId, queue, params);
  callback.call(scope, [Protocol.createSubscribeResponseMessage(clientId, queue, result[0], result[1])]);
};

Server.prototype.receive = function(clientId, callback, scope) {
  this._engine.receive(clientId, callback, scope);
};