var Connection = function(endpoint) {
  this.id = null;
  this.state = Connection.CLOSED;
  this.protocol = Protocol;
  this.messages = [];
  this._queues = {};

  this.init(endpoint);

  this.connect();
};

Connection.prototype = new transport.Transport();
Connection.constructor = Connection;

Connection.CONNECTING = 0; //Connection message was sent
Connection.OPEN = 1; //Connection established
Connection.DELAY = 2; //Send connect request later
Connection.ERROR = 3; //Error during connection, reconnect automatically or manually
Connection.BROKEN = 4; //Backend broken, reconnect not possible
Connection.CLOSED = 5; //Not connected yet or connection was closed manually

Connection.prototype.prepareReceiveMessage = function() {
  if(this.state === Connection.OPEN) {
    return JSON.stringify([Protocol.createReceiveMessage(this.id)]);
  }

  return null;
};

Connection.prototype.prepareSendMessage = function() {
  var message = null;

  if(this.messages.length !== 0) {
    message =  JSON.stringify(this.messages);
    this.messages = [];
  }

  return message;
};

Connection.prototype.addSocket = function(socket) {
  this._queues[socket._queue] = {};
  this._queues[socket._queue].socket = socket;
  this._queues[socket._queue].status = Connection.CLOSED;
};

Connection.prototype.connectSocket = function(socket) {
  if(this.state === Connection.OPEN) {
    this.subscribe(socket._queue, socket.connectionParams);
  } else {
    this._queues[socket._queue].status = Connection.DELAY;
  }
};

Connection.prototype._receive = function(status, data) {
  if(status === 'error') {
    this._reconnect();
    return;
  }

  try {
    var messages = JSON.parse(data);
    for (var i = 0, n = messages.length; i < n; i++) {
      this._handle(messages[i]);
    }
  } catch(e) {}
};

Connection.prototype._handle = function(message, callback, scope) {
  var action = message.action;

  if(action === 'connect')
    this._connected(message.id);
  if(action === 'subscribed')
    this._subscribed(message.queue, message.status, message.params);
  if(action === 'receive')
    this._received(message.queue, message.status, message.data);
};

Connection.prototype.connect = function() {
  if(this.state === Connection.CLOSED) {
    var connectMessage = Protocol.createConnectMessage(this.id);
    this.messages.push(connectMessage);
    this.state = Connection.CONNECTING;
  }
};

Connection.prototype.subscribe = function(queue, params) {
  this.messages.push(Protocol.createSubscribeMessage(this.id, queue, params));
};

Connection.prototype._connected = function(id) {
  if(id !== null) {
    this.state = Connection.OPEN;
    this.id = id;
    this._updateSubscriptions();
  }
};

Connection.prototype._updateSubscriptions = function() {
  for(var queue in this._queues) {
    if(this._queues[queue].status === Connection.DELAY) {
      this.subscribe(queue, this._queues[queue].socket.connectionParams);
      this._queues[queue].status = Connection.CONNECTING;
    }
  }
};

Connection.prototype._subscribed = function(queue, status, params) {
  if(status === Protocol.SUBSCRIBE_OK) {
    this._queues[queue].socket.onopen(params);
    this._queues[queue].status = Connection.OPEN;
  }
  if(status === Protocol.SUBSCRIBE_ERROR || status == Protocol.QUEUE_NOT_FOUND) {
    this._queues[queue].socket.onerror(status, params);
    this._queues[queue].status = Connection.BROKEN;
  }
  if(status === Protocol.CLIENT_NOT_EXIST) {
    this._reconnect();
  }
};

Connection.prototype._received = function(queue, status, data) {
  if(status === Protocol.CLIENT_NOT_EXIST) {
    this._reconnect();
    return;
  }

  this._queues[queue].socket.onmessage(data);
};

Connection.prototype._reconnect = function() {
  this.state = Connection.CLOSED;
  for(var queue in this._queues) {
    if(this._queues[queue].status !== Connection.BROKEN) {
      this._queues[queue].status = Connection.DELAY;
    }
  }

  var self = this;
  var timerFunction = function() { self.connect(); };

  setTimeout(timerFunction, 5000);
};
