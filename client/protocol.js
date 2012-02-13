var Protocol = function() {
};

Protocol.SUBSCRIBE_OK = 200;
Protocol.SUBSCRIBE_ERROR = 201;
Protocol.CLIENT_NOT_EXIST = 400;
Protocol.QUEUE_NOT_FOUND = 401;

if(typeof module !== 'undefined') {
  module.exports = Protocol;
}

Protocol.createMessage = function(id, action) {
  return {
    action: action,
    id: id
  };
};

Protocol.createConnectMessage = function(id) {
  var message = this.createMessage(id, 'connect');
  return message;
};

Protocol.createConnectResponseMessage = function(id) {
  var message = this.createMessage(id, 'connect');
  return message;
};

Protocol.createReceiveMessage = function(id) {
  var message = this.createMessage(id, 'receive');
  return message;
};

Protocol.createReceiveResponseMessage = function(id, queue, status, data) {
  var message = this.createMessage(id, 'receive');
  message.queue = queue;
  message.status = status;
  message.data = data;
  return message;
};

Protocol.createSubscribeMessage = function(id, queue, params) {
  var message = this.createMessage(id, 'subscribe');
  message.queue = queue;
  message.params = params;
  return message;
};

Protocol.createSubscribeResponseMessage = function(id, queue, status, params) {
  var message = this.createMessage(id, 'subscribed');
  message.queue = queue;
  message.status = status;
  message.params = params;
  return message;
};
