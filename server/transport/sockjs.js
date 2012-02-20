var sockjs = require('sockjs');

var Sockjs = function(httpServer, engine) {
  this.server = httpServer;
  this.engine = engine;

  var sockjs_opts = {
    sockjs_url: "http://sc2tv.ru/sockjs-0.2.1.min.js",
    websocket: false,
    jsessionid: false
  };

  this.sockjsServer = sockjs.createServer(sockjs_opts);

  this.init();

  this.sockjsServer.installHandlers(this.server);
};

module.exports = Sockjs;

Sockjs.prototype.init = function() {
  var self = this;

  this.sockjsServer.on('connection', function(conn) {
    self.connect(conn.id, conn);

    conn.on('data', function(m) {
      try {
        var message = JSON.parse(m);
        var action = message.action;

        if(action === 'subscribe') {
          self.subscribe(conn.id, message.queue, message.params);
        }
      } catch(e) {}
    });
    conn.on('close', function() {
      self.disconnect(conn.id);
    });
  });
};

Sockjs.prototype.connect = function(clientId, connection) {
  this.engine.createClient(clientId, connection);
};

Sockjs.prototype.disconnect = function(clientId) {
  this.engine.deleteClient(clientId);
};

Sockjs.prototype.subscribe = function(clientId, queue, params) {
  this.engine.subscribe(clientId, queue, params);
};
