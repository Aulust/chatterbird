var Core = function() {
    this._connection = null;
    this._servers = this._getConfiguration();
    this._queues = [];

    this._connect();
};

Core.prototype._getConfiguration = function() {
    var data = this._getCookie('nodeConfig');

    if(!data) {
        return null;
    }

    var config = JSON.parse(decodeURIComponent(data));
    var servers = {};

    /*for(var server in config) {
        if(typeof(server) === 'string') {
            servers[server] = { status: 'normal' };
        }
    }*/

    return config;
};

Core.prototype._getCookie = function(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');

  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
};

Core.prototype._connect = function() {
    console.log(this._servers[0]);
    this.connection = new SockJS(this._servers[0]);

    this.connection.onopen = this._connected.bind(this);
    this.connection.onmessage = this._handle.bind(this);
    this.connection.onclose = function(a) {
        console.log('error');
        console.log(a);
    };
};

Core.prototype._connected = function() {
    console.log('sdfdfd');
};

Core.prototype._handle = function(a) {
    console.log(a);
};

Core.prototype.register = function(socket) {
    this._queues[socket._queue] = {};
    this._queues[socket._queue].socket = socket;
    this._queues[socket._queue].status = Connection.CLOSED;
};
