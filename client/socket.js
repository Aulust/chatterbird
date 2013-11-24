var Socket = function(queue) {
    this.queue = queue;
    this._events = {};
    Engine.register(this);
};

Socket.init = function(config) {
    Engine._init(config);
};

Socket.prototype.fire = function(event, data) {
    Engine.fire(this.queue, event, data);
};

Socket.prototype.on = function(event, callback) {
    var events = this._events[event] || (this._events[event] = []);
    events.push(callback);
    return this;
};

Socket.prototype.off = function(event) {
    if (!event) {
        return this;
    }

    if (this._events.hasOwnProperty(event)) {
        this._events[event] = [];
    }

    return this;
};

Socket.prototype.trigger = function(name) {
    var args = Array.prototype.slice.call(arguments, 1);
    var events = this._events[name];

    if (events) {
        for (var i = 0, len = events.length; i < len; i++) {
            events[i].apply(this, args);
        }
    }

    return this;
};
