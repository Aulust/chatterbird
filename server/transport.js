var Session = require('./session');

var Transport = function(engine) {
    this._engine = engine;
    this._sessions = {};

    this._router = {
        'OPTIONS': {
            'info': '_info_options',
            'xhr_send': '_xhr_options'
        },
        'GET': {
            'info': '_options',
            'iframe.html': '_iframe'
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
            var origin = (request.headers.origin || "*");
            var headers = request.headers['access-control-request-headers'];

            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", true);
            response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
            if (headers) response.setHeader('Access-Control-Allow-Headers', headers);

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

Transport.prototype._info_options = function(params, response) {
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    response.setHeader('Access-Control-Max-Age', response.cache_for);
    response.writeHead(204);
    response.end();
};

Transport.prototype._xhr_options = function(params, response) {
    response.setHeader('Access-Control-Max-Age', response.cache_for);
    response.writeHead(204);
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

Transport.prototype.iframe_template = '<!DOCTYPE html>' +
'<html><head><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
'<script>document.domain = document.domain;_sockjs_onload = function(){SockJS.bootstrap_iframe();};</script>' +
'<script src="http://cdn.sockjs.org/sockjs-0.3.js"></script>' +
'</head><body><h2>Don\'t panic!</h2><p>This is a SockJS hidden iframe. It\'s used for cross domain magic.</p></body></html>';

Transport.prototype._iframe = function(params, response, request) {
    response.writeHead(200);
    response.end(this.iframe_template);
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
