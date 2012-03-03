var Connection = function(endpoint) {
  this.id = null;
  this.state = Connection.CLOSED;
  this.protocol = Protocol;
  this.messages = [];
  this._queues = {};
  this._endpoint = endpoint;

  this.connect();
};

Connection.CONNECTING = 0; //Connection message was sent
Connection.OPEN = 1; //Connection established
Connection.DELAY = 2; //Send connect request later
Connection.ERROR = 3; //Error during connection, reconnect automatically or manually
Connection.BROKEN = 4; //Backend broken, reconnect not possible
Connection.CLOSED = 5; //Not connected yet or connection was closed manually

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

Connection.prototype._handle = function(message) {
  var action = message.action;

  if(action === 'subscribed')
    this._subscribed(message.queue, message.status, message.params);
  if(action === 'receive')
    this._received(message.queue, message.status, message.data);
};

Connection.prototype.connect = function() {
  if(this.state === Connection.CLOSED) {
    this.state = Connection.CONNECTING;
    this.transport = new SockJS(this._endpoint);

    var self = this;

    this.transport.onopen = function() {
      self._connected();
    };
    this.transport.onmessage = function(message) {
      var data = JSON.parse(message.data);
      self._handle(data);
    };
    this.transport.onclose = function() {
      self._reconnect();
    };
  }
};

Connection.prototype.subscribe = function(queue, params) {
  this.transport.send(JSON.stringify(Protocol.createSubscribeMessage(queue, params)));
};

Connection.prototype.send = function(queue, data) {
  this.transport.send(JSON.stringify(Protocol.createPublishMessage(queue, data)));
};

Connection.prototype._connected = function() {
  this.state = Connection.OPEN;
  this._updateSubscriptions();
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
  /*if(status === Protocol.CLIENT_NOT_EXIST) {
    this._reconnect();
  }*/
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
  delete this.transport;
  for(var queue in this._queues) {
    if(this._queues[queue].status !== Connection.BROKEN) {
      this._queues[queue].status = Connection.DELAY;
    }
  }

  var self = this;
  var timerFunction = function() { self.connect(); };

  setTimeout(timerFunction, 25000);
};
