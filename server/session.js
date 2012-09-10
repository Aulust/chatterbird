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

Session.prototype.send = function(data) {
    if (this._status !== OPEN)
        return;

    this._buffer.push('' + data);
    if (this.res) {
        this._sendBuffer();
    }
};

Session.prototype._sendFrame = function(frame) {
    try {
        this.res.write(frame + '\n');
    } catch (x) {}

    this.lastAction = new Date();
    this._close();
};

Session.prototype._sendBuffer = function() {
    if(this._buffer.length > 0) {
        this._sendFrame('a' + '[' + this._buffer.join(',') + ']');
        this._buffer = [];
    }
};

Session.prototype._close = function() {
    this.res.end();
    this.res = null;
};
