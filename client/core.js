var Core = function() {
    this._connection = null;
    this._servers = this._getConfiguration();
    this._numServers = this._servers.length;
    this._serverId = this._getRand(this._numServers);
    this._queues = [];

    this._connect();
    /*setInterval(function() {
        if(this._connection !== null) {
            this._connection.send('Yes we nya!');
        }
    }.bind(this), 10000);*/
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
    this._connection = new SockJS(this._servers[this._serverId], null, {debug: true, protocols_whitelist: ['xdr-polling', 'xhr-polling']});

    this._connection.onopen = this._connected.bind(this);
    this._connection.onmessage = this._handle.bind(this);
    this._connection.onclose = this._close.bind(this);
};

Core.prototype._connected = function() {
    console.log('sdfdfd');
};

Core.prototype._handle = function(a) {
    console.log(a);
};

Core.prototype._close = function(a) {
    this._connection = null;
    for(var i = 0; i< this._queues.length; i++) {
        this._queues[i].onclose();
        delete this._queues[i];
    }

    console.log(a);

    //this._connect();
};

Core.prototype.register = function(socket) {
    this._queues[socket._queue] = socket;
};
