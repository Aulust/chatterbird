var Socket = function(queue) {
    this.queue = queue;
    Engine.register(this);
};

Socket.prototype.send = function(data) {
    Engine.send(this, data);
};
