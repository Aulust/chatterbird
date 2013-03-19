var fs = require('fs');

var Transport = require('./transport');

var Engine = function(config) {
    this._clientQueues = {};
    this._queues = {};
    this._transport = new Transport(this);

    fs.readdirSync('./queues').forEach(function (queue) {
        var queueName = queue.slice(0, queue.length - 3);
        var Queue = require('./queues/' + queueName);

        this._queues[queueName] = new Queue(config.queues[queueName]);
        this._queues[queueName].on('publish', this.publish.bind(this, queueName));
    }, this);

    this._queues['admin']._engine = this;
    this._queues['admin']._transport = this._transport;
};

module.exports = Engine;

Engine.prototype.register = function(server) {
    this._transport.register(server);
};

Engine.prototype.createClient = function(clientId) {
    this._clientQueues[clientId] = [];
};

Engine.prototype.deleteClient = function(clientId) {
    if(!this._clientQueues[clientId]) {
        return;
    }

    this._clientQueues[clientId].forEach(function(queue) {
        this._queues[queue].emit('unsubscribe', clientId);
    }, this);

    delete this._clientQueues[clientId];
};

Engine.prototype.message = function(clientId, data) {
    if(!this._clientQueues[clientId]) {
        return;
    }

    if(this._validateMessage(data)) {
        if(this._clientQueues[clientId].indexOf(data.queue) == -1) {
            this._queues[data.queue].emit('subscribe', clientId);
            this._clientQueues[clientId].push(data.queue);
        }

        this._queues[data.queue].emit('message', data.message);
    }
};

Engine.prototype.publish = function(queue, clients, message) {
    this._transport.send(clients, {queue: queue, message: message});
};

Engine.prototype._validateMessage = function(data) {
    return Object.prototype.toString.call(data) === "[object Object]" &&
        data.hasOwnProperty('queue') && data.hasOwnProperty('message') &&
        this._queues.hasOwnProperty(data.queue);
};
