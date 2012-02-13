var Queue = function() {
};

module.exports = Queue;

Queue.prototype.init = function(engine, config) {
  this._queueName = config.name;
  this._engine = engine;
  this._config = config;
};

Queue.prototype.deliverMessage = function(clients, data) {
  var message = Protocol.createReceiveResponseMessage(this.id, queue, Protocol.OK, data);
};
