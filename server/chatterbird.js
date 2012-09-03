/*var http  = require('http');
var Engine = require('./engine');
var Transport = require('./transport/sockjs');

var config = require(process.argv[2]);
var serverName = process.argv[3];

var httpServer = http.createServer(function() {});
var engine = new Engine(config, serverName);
var transport = new Transport(httpServer, engine);

httpServer.listen(config[serverName].port);
*/

var http = require('http');
var Transport = require('./transport');

var transport = new Transport();
var server = http.createServer();
transport.register(server);

console.log(' [*] Listening on 0.0.0.0:10000' );
server.listen(10000, '0.0.0.0');
