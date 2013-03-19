var http  = require('http');
var config = require('./config');

var Engine = require('./engine');

var httpServer = http.createServer();
var engine = new Engine(config);

engine.register(httpServer);
httpServer.listen(config.port);
