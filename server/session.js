var CONNECTING = 1;
var OPEN = 2;

var Session = function() {
    this.res = null;
    this._buffer = [];
    this._status = CONNECTING;
    this.lastAction = new Date();
};

module.exports = Session;

Session.prototype.register = function(response) {
    this.res = response;

    if (this._status === CONNECTING) {
        this._sendFrame('o');
        this._status = OPEN;
    }

    this._sendBuffer();
};

Session.prototype.destroy = function() {
    this._buffer = null;
};

Session.prototype.heartbeat = function() {
    this._sendFrame('h');
};

Session.prototype._sendFrame = function(frame) {
    try {
        this.res.write(frame + '\n');
    } catch (x) {}

    this.lastAction = new Date();
    this._close();
};

Session.prototype._sendBuffer = function() {
    
};

Session.prototype._close = function() {
    this.res.end();
    this.res = null;
};
