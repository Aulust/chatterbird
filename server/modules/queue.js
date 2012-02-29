var Protocol = require('../../client/protocol');

var Queue = function() {
};

module.exports = Queue;

Queue.prototype.deliverMessage = function(clients, data) {
  var message = JSON.stringify(Protocol.createReceiveResponseMessage(this._queueName, Protocol.OK, data));
  var type = Object.prototype.toString.call(clients);
  var client = null;

  if(type === '[object Object]') {
    for(var clientId in clients) {
      client = this._engine.getClient(clientId);
      if(client) client.addMessage(message);
    }
  }
  else if(type === '[object Array]') {
    for(var i=0, len=clients.length; i<len; i++) {
      client = this._engine.getClient(clients[i]);
      if(client) client.addMessage(message);
    }
  }
  else {
    client = this._engine.getClient(clients);
    if(client) client.addMessage(message);
  }
};
