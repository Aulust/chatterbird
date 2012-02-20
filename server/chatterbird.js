var http  = require('http');
var Engine = require('./engine');
var Transport = require('./transport/sockjs');

var config = require(process.argv[2]);
var serverName = process.argv[3];

var httpServer = http.createServer(function() {});
var engine = new Engine(config, serverName);
var transport = new Transport(httpServer, engine);

httpServer.listen(config[serverName].port);
