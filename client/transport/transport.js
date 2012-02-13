transport.Transport = function() {
};

transport.Transport.prototype.init = function(endpoint) {
  this.endpoint = endpoint;
  this._transport = this.getTransport(this.endpoint);

  if(this._transport === null) {
    return false;
  }

  this.receiveRequest();
  this.sendRequest();

  return true;
};

transport.Transport.prototype.transports = [transport.XHR];

transport.Transport.prototype.getTransport = function(endpoint) {
  for(i=0; i<this.transports.length; i++) {
    if(this.transports[i].prototype.isUsable(endpoint)) {
      return this.transports[i];
    }
  }

  return null;
};

transport.Transport.prototype.receiveRequest = function() {
  var messages = this.prepareReceiveMessage();

  if(messages !== null) {
    this.receiveTransport = new this._transport(messages, this.endpoint, this._receive, this._retryReceive, this);
  } else {
    this._retryReceive();
  }
};

transport.Transport.prototype.sendRequest = function() {
  var messages = this.prepareSendMessage();

  if(messages !== null) {
    this.sendTransport = new this._transport(messages, this.endpoint, this._receive, this._retrySend, this);
  } else {
    this._retrySend();
  }
};

transport.Transport.prototype._receive = function(status, data) {
  console.log(data);
};

transport.Transport.prototype._retryReceive = function() {
  var self = this;
  var timerFunction = function() { self.receiveRequest(); };

  this.receiveTimer = setTimeout(timerFunction, 300);
};

transport.Transport.prototype._retrySend = function() {
  var self = this;
  var timerFunction = function() { self.sendRequest(); };

  this.sendTimer = setTimeout(timerFunction, 800);
};

transport.Transport.prototype.prepareReceiveMessage = function() {
  return null;
};

transport.Transport.prototype.prepareSendMessage = function() {
  return null;
};
