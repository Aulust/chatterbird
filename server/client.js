var Protocol = require('../client/protocol');

var Client = function(id, connection) {
  this.id = id;
  this.connection = connection;
};

module.exports = Client;

Client.prototype.addMessage = function(queue, data) {
  this.connection.write(JSON.stringify(Protocol.createReceiveResponseMessage(this.id, queue, Protocol.OK, data)));
};

Client.prototype._delete = function() {
  this.id = null;
  this.connection = null;
};