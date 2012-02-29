var Client = function(id, connection) {
  this.id = id;
  this.connection = connection;
};

module.exports = Client;

Client.prototype.addMessage = function(message) {
  this.connection.write(message);
};

Client.prototype._delete = function() {
  this.id = null;
  this.connection = null;
};