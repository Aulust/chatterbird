var Protocol = function() {
};

Protocol.SUBSCRIBE_OK = 200;
Protocol.SUBSCRIBE_ERROR = 201;
Protocol.CLIENT_NOT_EXIST = 400;
Protocol.QUEUE_NOT_FOUND = 401;

if(typeof module !== 'undefined') {
  module.exports = Protocol;
}

Protocol.createMessage = function(action) {
  return {
    action: action
  };
};

Protocol.createReceiveResponseMessage = function(queue, status, data) {
  var message = this.createMessage('receive');
  message.queue = queue;
  message.status = status;
  message.data = data;
  return message;
};

Protocol.createSubscribeMessage = function(queue, params) {
  var message = this.createMessage('subscribe');
  message.queue = queue;
  message.params = params;
  return message;
};

Protocol.createSubscribeResponseMessage = function(queue, status, params) {
  var message = this.createMessage('subscribed');
  message.queue = queue;
  message.status = status;
  message.params = params;
  return message;
};

Protocol.createPublishMessage = function(queue, data) {
  var message = this.createMessage('publish');
  message.queue = queue;
  message.data = data;
  return message;
};