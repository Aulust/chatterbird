var util = require("util");
var events = require("events");
var http = require('http');
var url = require('url');

/*
* This is special queue with access to server internals
*/
var Admin = function(config) {
    this._config = config;
    this._clients = {};

    this.on('subscribe', this.subscribe.bind(this));
    this.on('unsubscribe', this.unsubscribe.bind(this));

    setInterval(this._publishInfo.bind(this), 4000);
    this._serve();
};

module.exports = Admin;

util.inherits(Admin, events.EventEmitter);


Admin.prototype._serve = function () {
    http.createServer(function (req, res) {
        var requestObj = url.parse(req.url);

        switch (requestObj.pathname)  {
            case '/stats' :
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.write(Object.keys(this._transport._sessions).length.toString());
                break;
            default :
                res.writeHead(404);
                break;
        }

        res.end();
    }.bind(this)).listen(this._config.listenPort, this._config.domainName);
};

Admin.prototype.subscribe = function(clientId) {
    this._clients[clientId] = '';
};

Admin.prototype.unsubscribe = function(clientId) {
    delete this._clients[clientId];
};

Admin.prototype._publishInfo = function() {
    var data = {
        'sessions': Object.keys(this._transport._sessions),
        'queues': Object.keys(this._engine._queues),
        'clientsInfo': this._engine._clientQueues
    };

    this.emit('publish', this._clients, data);
};
