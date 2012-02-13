var Stream = function(engine, config) {
  this._engine = engine;
  this._config = config;
  this._clients = {};

  this.http = require('http');

  var self = this;

  this.http.createServer(function (req, res) {
    var requestMethod = req.method;

    if (requestMethod === 'POST') {
      waitForPostData(req, function(data) {
        try {
          var message = JSON.parse(data);

          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end();

          for(var client in self._clients) {
            self._clients[client].addMessage('stream', message);
          }
        }
        catch(e) {}
      });
    } else {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end();
    }
  }).listen(config.notificationsPort, "127.0.0.1");
};

module.exports = Stream;

Stream.prototype.subscribe = function(client, params) {
  this._clients[client.id] = client;

  return [200, null];
};

Stream.prototype.unsubscribe = function(client) {
  delete this._clients[client.id];
};

function waitForPostData(request, callback) {
  var _content = '';

  request.addListener('data', function(chunk) {
    _content += chunk;
  });

  request.addListener('end', function() {
    callback(_content);
  });
}