var Core = {
  _connections: {},
  _servers: servers
};

Core.getConnection = function(socket) {
  var queue = socket._queue;
  var queueServers = [];

  for(var server in this._servers) {
    for(var i=0; i<this._servers[server].queues.length; i++) {
      if(this._servers[server].queues[i] === queue) {
        queueServers.push(server);
      }
    }
  }

  for(var i=0; i<queueServers.length; i++) {
    if(queueServers[i] in this._connections) {
      return this._connections[queueServers[i]];
    }
  }

  var rand = Math.floor(Math.random()*queueServers.length);
  this._connections[queueServers[rand]] = new Connection(this._servers[queueServers[rand]].address);

  return this._connections[queueServers[rand]];
};
