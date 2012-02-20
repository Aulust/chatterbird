var Core = function() {
  this._connections = {};
  this._servers = this._getConfiguration();
};

Core.prototype._getConfiguration = function() {
  var data = this.getCookie('ttt');
  var config = JSON.parse('{"node1":{"address":"http://sc2tv.ru/notifications","queues":["admin","stream"]}}');

  for(var server in this._servers) {
    if(typeof(server.address) != 'string' || !(server.queues instanceof Array)) {
        return null;
    }
  }

  return config;
};

Core.prototype.getCookie = function(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');

  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
};

Core.prototype.getConnection = function(socket) {
  var queue = socket._queue;
  var queueServers = [];
  var i;

  for(var server in this._servers) {
    for(i=0; i<this._servers[server].queues.length; i++) {
      if(this._servers[server].queues[i] === queue) {
        queueServers.push(server);
      }
    }
  }

  for(i=0; i<queueServers.length; i++) {
    if(queueServers[i] in this._connections) {
      return this._connections[queueServers[i]];
    }
  }

  var rand = Math.floor(Math.random()*queueServers.length);
  this._connections[queueServers[rand]] = new Connection(this._servers[queueServers[rand]].address);

  return this._connections[queueServers[rand]];
};
