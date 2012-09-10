var Session = require('./session');

var Transport = function(engine) {
    this._engine = engine;
    this._sessions = {};

    this._router = {
        'GET': {
            'info': '_options'
        },
        'POST': {
            'xhr': '_xhr',
            'xhr_send': '_xhr_send'
        }
    };

    setInterval(this._maintains.bind(this), 15000);
};

module.exports = Transport;

Transport.prototype.register = function(server) {
    server.addListener('request', this.handle.bind(this));
};

Transport.prototype.send = function(sessionIds, data) {
    var message = JSON.stringify(data);
    var type = Object.prototype.toString.call(sessionIds);

    if(type === '[object Object]') {
        for(var sessionId in sessionIds) {
            this._sessions[sessionId].send(message);
        }
    }
};

Transport.prototype.handle = function(request, response) {
    var params = this._parseRequest(request.url);

    if(this._router[request.method]) {
        if(this._router[request.method][params.method]) {
            return this[this._router[request.method][params.method]](params, response, request);
        }
    }

    return this.notFound(response);
};

Transport.prototype._parseRequest = function(url) {
    var params = url.split('/');
    var length = params.length;

    return {
        sessionId: params[length - 2],
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

    if(!(params.sessionId in this._sessions)) {
        this._sessions[params.sessionId] = new Session();
        this._engine.createClient(params.sessionId);
    }

    this._sessions[params.sessionId].register(response);
};

Transport.prototype._xhr_send = function(params, response, request) {
    var body = '';

    request.on('data', function (data) {
        body += data;
    });
    request.on('end', function () {
        if(params.sessionId in this._sessions) {
            try {
                JSON.parse(body).forEach(function(message) {
                    this._engine.message(params.sessionId, JSON.parse(message));
                }, this);
            } catch (e) {}
        }

        response.writeHead(200);
        response.end();
    }.bind(this));
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
                this._engine.deleteClient(sessionId);
            }
        }
    }
};
