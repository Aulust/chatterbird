var Core = function() {
    this._connection = null;
    this._connectStatus = false;
    this._servers = nodeConfig//this._getConfiguration();
    this._numServers = this._servers.length;
    this._serverId = this._getRand(this._numServers);
    this._queues = {};

    this._connect();
};

Core.prototype._getConfiguration = function() {
    var data = this._getCookie('nodeConfig');

    if(!data) {
        return null;
    }

    return JSON.parse(decodeURIComponent(data));
};

Core.prototype._getCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');

    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
};

Core.prototype._getRand = function(max) {
    return Math.floor(Math.random() * max);
};

Core.prototype._connect = function() {
    this._serverId = (this._serverId + 1) % this._numServers;
    this._connection = new SockJS(this._servers[this._serverId], null, {protocols_whitelist: ['xdr-polling', 'xhr-polling']});

    this._connection.onopen = this._connected.bind(this);
    this._connection.onmessage = this._handle.bind(this);
    this._connection.onclose = this._close.bind(this);
};

Core.prototype._connected = function() {
    this._connectStatus = true;
};

Core.prototype._handle = function(data) {
    var queue = data.data.queue;
    var message = data.data.message;

    if(this._queues.hasOwnProperty(queue)) {
        this._queues[queue].emit('message', message);
    }
};

Core.prototype._close = function(e) {
    this._connection = null;
    for(var queue in this._queues) {
        this._queues[queue].emit('close');
        delete this._queues[queue];
    }

    this._connectStatus = false;

    if(e.code !== 2000) {
        setTimeout(this._connect.bind(this), 2000);
    }
};

Core.prototype.register = function(socket) {
    this._queues[socket.queue] = socket;

    var self = this;
    var sendConnect = function() {
        if(self._connectStatus) {
            self._connection.send(JSON.stringify({queue: socket.queue, message: ''}));
            socket.emit('open');
        } else {
            setTimeout(sendConnect, 500);
        }
    };

    sendConnect();
};

Core.prototype.send = function(socket, message) {
    if(self._connectStatus) {
        self._connection.send(JSON.stringify({queue: socket.queue, message: message}));
    }
};
