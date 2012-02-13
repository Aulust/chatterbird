var Socket = function(queue) {
  this._queue = queue;
  this._connection = Core.getConnection(this);
  this._connection.addSocket(this);
  this.connectionParams = null;
};

Socket.prototype.connect = function(data) {
  this.connectionParams = data;
  this._connection.connectSocket(this);
};
