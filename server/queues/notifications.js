var util = require("util");
var events = require("events");
//var amanda = require('amanda');

var Notifications = function(config) {
  this._config = config;
  this._clients = {};

/*  this.http = require('http');

  var self = this;

  this.http.createServer(function (req, res) {
    var requestMethod = req.method;

    if (requestMethod === 'POST') {
      self.utils.waitForPostData(req, function(data) {
        try {
          var message = JSON.parse(data);

          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end();

          self.processMessage(message);
        }
        catch(e) {}
      });
    } else {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end();
    }
  }).listen(config.notificationsPort, "127.0.0.1");*/
};

module.exports = Notifications;

util.inherits(Notifications, events.EventEmitter);

/*
Notifications.prototype.subscribe = function(clientId) {
  this._clients[clientId] = '';

  return [200, null];
};

Notifications.prototype.unsubscribe = function(clientId) {
  delete this._clients[clientId];
};

Notifications.prototype.publish = function(clientId, data) {
};

Notifications.prototype.processMessage = function(message) {
  var self = this;
  amanda.validate(message, this.streamScheme, function(error) {
    if (!error) {
      message.description.title = self.utils.strip_tags(message.description.title);
      if(message.description.teaser) {
        message.description.teaser = self.utils.strip_tags(message.description.teaser);
      }
      if(message.description.game) {
        message.description.game = self.utils.strip_tags(message.description.game);
      }
      message.casters.caster = self.utils.strip_tags(message.casters.caster);
      if(message.casters['co-casters']) {
        for(var i=0, len = message.casters['co-casters'].length; i < len; i++) {
          message.casters['co-casters'][i] = self.utils.strip_tags(message.casters['co-casters'][i]);
        }
      }
      if(message.link) {
        if(message.link.url) {
          message.link.url = self.utils.strip_tags(message.link.url);
        }
        if(message.link.image) {
          message.link.image = self.utils.strip_tags(message.link.image);
        }
      }

      self.deliverMessage(self._clients, message);
    } else {
      console.log(error);
    }
  });
};

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