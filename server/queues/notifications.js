var util = require("util");
var events = require("events");
var http = require('http');

var Utils = require("../utils");


var Notifications = function(config) {
    this._clients = {};

    http.createServer(function (req, res) {
        if (req.method === 'POST') {
            Utils.waitForPostData(req, function(data) {
                try {
                    this.processMessage(JSON.parse(data));
                }
                catch(e) {}
            }.bind(this));
        }

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end();
    }.bind(this)).listen(config.notificationsPort, "127.0.0.1");

    this.on('subscribe', this.subscribe.bind(this));
    this.on('unsubscribe', this.unsubscribe.bind(this));
};

module.exports = Notifications;

util.inherits(Notifications, events.EventEmitter);


Notifications.prototype.subscribe = function(clientId) {
    this._clients[clientId] = '';
};

Notifications.prototype.unsubscribe = function(clientId) {
    delete this._clients[clientId];
};

Notifications.prototype.processMessage = function(message) {
    message.description.title = Utils.strip_tags(message.description.title);
    message.description.title = Utils.filter_text(message.description.title);
    if(message.description.teaser) {
        message.description.teaser = Utils.strip_tags(message.description.teaser);
        message.description.teaser = Utils.filter_text(message.description.teaser);
        message.description.teaser = Utils.trim_text(message.description.teaser, 150);
    }
    if(message.description.game) {
        message.description.game = Utils.strip_tags(message.description.game);
    }
    message.casters.caster = Utils.strip_tags(message.casters.caster);
    if(message.casters['co-casters']) {
        for(var i = 0, len = message.casters['co-casters'].length; i < len; i++) {
            message.casters['co-casters'][i] = Utils.strip_tags(message.casters['co-casters'][i]);
        }
    }
    if(message.link) {
        if(message.link.url) {
            message.link.url = Utils.strip_tags(message.link.url);
        }
        if(message.link.image) {
            message.link.image = Utils.strip_tags(message.link.image);
        }
    }

    this.emit('publish', this._clients, message);
};
/*
Notifications.prototype.streamScheme = {
  type: 'object',
  properties: {
    type: {
      required: true,
      type: 'string',
      enum: ['stream', 'userstream']
    },
    description: {
      required: true,
      type: 'object',
      properties: {
        title: {
          required: true,
          type: 'string'
        },
        teaser: {
          type: 'string'
        },
        game: {
          type: 'string'
        }
      }
    },
    casters: {
      required: true,
      type: 'object',
      properties: {
        caster: {
          required: true,
          type: 'string'
        },
        'co-casters': {
          type: 'array'
        }
      }
    },
    link: {
      type: 'object',
      properties: {
        url: {
          required: true,
          type: 'string',
          format: 'url'
        },
        image: {
          type: 'string'
        }
      }
    }
  }
};
*/
