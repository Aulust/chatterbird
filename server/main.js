var http  = require('http');
var config = require(process.argv[2]);

var Engine = require('./engine');

var serverName = process.argv[3];
var httpServer = http.createServer();
var engine = new Engine(config[serverName]);

engine.register(httpServer);
httpServer.listen(config[serverName].port);
