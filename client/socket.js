var Socket = function(queue) {
    this.queue = queue;
    Engine.register(this);
};

Socket.init = function(config) {
    Engine._init(config);
};

Socket.prototype.send = function(data) {
    Engine.send(this, data);
};

Socket.prototype.emit = function(type) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (this['on' + type]) {
        this['on' + type].apply(this, args);
    }
};
