var Core = function() {
    this._connection = null;
    this._connected = false;
    this._servers = null;
    this._queues = {};
    this.messages = [];
};

Core.prototype._init = function(config) {
    if(this._servers != null) {
        return;
    }

    this._servers = config;
    this._numServers = this._servers.length;
    this._serverId = Math.floor(Math.random() * this._numServers);

    this._connect();
};

Core.prototype._connect = function() {
    this._serverId = (this._serverId + 1) % this._numServers;
    this._connection = new SockJS(this._servers[this._serverId], null, {protocols_whitelist: ['xdr-polling', 'xhr-polling', 'iframe-xhr-polling']});

    this._connection.onopen = this._open.bind(this);
    this._connection.onmessage = this._handle.bind(this);
    this._connection.onclose = this._close.bind(this);
};

Core.prototype._open = function() {
    var messages = this.messages;
    this.messages = [];

    for (var queue in this._queues) {
        this.fire(queue, 'connect');
    }
    for (var i = 0, len = messages.length; i < len; i++) {
        if (messages[i].event !== 'connect') {
            this.messages.add(messages[i]);
        }
    }

    this._connected = true;

    this._flush();
};

Core.prototype._handle = function(data) {
    var handler = data.data.handler;

    if (this._queues.hasOwnProperty(handler)) {
        this._queues[handler].trigger(data.data.event, data.data.data);
    }
};

Core.prototype._close = function(e) {
    this._connection = null;
    this._connected = false;

    for (var queue in this._queues) {
        this._queues[queue].trigger('close');
    }

    if (e.code !== 2000) {
        setTimeout(this._connect.bind(this), 2000);
    } else {
        console.log('All transports failed');
    }
};

Core.prototype._flush = function() {
    for (var i = 0, len = this.messages.length; i < len; i++) {
        this._connection.send(JSON.stringify(this.messages[i]));
    }
    this.messages = [];
};

Core.prototype.register = function(socket) {
    this._queues[socket.queue] = socket;
    this.fire(socket.queue, 'connect');
};

Core.prototype.fire = function(handler, event, data) {
    if (!event) {
        return;
    }

    var message = {
        handler: handler,
        event: event
    };
    if (data) {
        message['data'] = data;
    }

    if (this._connected) {
        this._connection.send(JSON.stringify(message));
    } else {
        this.messages.push(message);
    }
};
