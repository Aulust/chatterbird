var Session = require('./session');

var Transport = function() {
    this._sessions = {};

    this._router = {
        'GET': {
            'info': '_options'
        },
        'POST': {
            'xhr': '_xhr'
        }
    };

    setInterval(this._maintains.bind(this), 15000);
    setInterval(function() {
        console.log(Object.keys(this._sessions));
    }.bind(this), 1000);
};

module.exports = Transport;

Transport.prototype.register = function(server) {
    server.addListener('request', this.handle.bind(this));
};

Transport.prototype.handle = function(request, response) {
    var params = this._parseRequest(request.url);

    if(this._router[request.method]) {
        if(this._router[request.method][params.method]) {
            return this[this._router[request.method][params.method]](params, response);
        }
    }

    return this.notFound(response);
};

Transport.prototype._parseRequest = function(url) {
    var params = url.split('/');
    var length = params.length;

    return {
        clientId: params[length - 2],
        method: params[length - 1]
    };
};

Transport.prototype.notFound = function(response) {
    response.writeHead(404);
    response.end();
};

Transport.prototype._options = function(params, response) {
    response.setHeader("Content-Type", "application/json; charset=UTF-8");
    response.writeHead(200);
    response.write(JSON.stringify({
        websocket: false,
        cookie_needed: false
    }));
    response.end();
};

Transport.prototype._xhr = function(params, response) {
    response.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    response.writeHead(200);

    if(!(params.clientId in this._sessions)) {
        this._sessions[params.clientId] = new Session();
    }

    this._sessions[params.clientId].register(response);
};

Transport.prototype._maintains = function() {
    var time = (new Date()).getTime();

    for(var sessionId in this._sessions) {
        var session = this._sessions[sessionId];

        if(time - session.lastAction.getTime() >= 15000) {
            if(session.res) {
                session.heartbeat();
            } else {
                session.destroy();
                delete this._sessions[sessionId];
            }
        }
    }
};
