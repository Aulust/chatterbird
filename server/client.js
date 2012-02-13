var Protocol = require('../client/protocol');

var Client = function(id) {
  this.id = id;
  this._messages = [];

  this._callback = null;
  this._callbackScope = null;
  this._recieveTimeout = null;
  this._recieveNowTimeout = null;
};

module.exports = Client;

Client.prototype.setReceiveRequest = function(callback, scope) {
  this.callback = callback;
  this.callbackScope = scope;

  if(this._messages.length === 0 ) {
    this._startReceiveTimer();
  } else {
    this._startReceiveNowTimer();
  }
};

Client.prototype.addMessage = function(queue, data) {
  this._messages.push(Protocol.createReceiveResponseMessage(this.id, queue, Protocol.OK, data));
  this._startReceiveNowTimer();
};

Client.prototype._delete = function() {
  this.id = null;
  this._messages = null;
  this.callback = null;
  this.callbackScope = null;

  if(this._recieveTimeout !== null) {
    clearTimeout(this._recieveTimeout);
  }
  if(this._recieveNowTimeout !== null) {
    clearTimeout(this._recieveNowTimeout);
  }
};

Client.prototype._startReceiveTimer = function() {
  var self = this;
  var timerFunction = function() {
    if(self.callback) {
      self.callback.call(self.callbackScope, JSON.stringify(self._messages));
      self._messages = [];
      self.callback = null;
      self.callbackScope = null;
    }
  };

  this._recieveTimeout = setTimeout(timerFunction, 10000);
};

Client.prototype._startReceiveNowTimer = function() {
  var self = this;
  var timerFunction = function() {
    if(self.callback) {
      self.callback.call(self.callbackScope, JSON.stringify(self._messages));
      self._messages = [];
      self.callback = null;
      self.callbackScope = null;
    }
  };

  if(this._recieveTimeout !== null) {
    clearTimeout(this._recieveTimeout);
  }

  this._recieveNowTimeout = setTimeout(timerFunction, 200);
};