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

var clients = {};

setInterval(function () {
    console.log(clients);
}, 1000);

var server = http.createServer();
server.addListener('request', function(req, res) {
    var url = req.url;

    if(/\/info$/.test(url) && req.method === 'GET') {
        options(req, res);
        res.end();
    }
    if(/\/xhr$/.test(url) && req.method === 'POST') {
        request(req, res);
    }
});

var options = function(req, res) {
    res.setHeader("Content-Type", "	application/json; charset=UTF-8");
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.write(JSON.stringify({
        websocket: false,
        cookie_needed: false,
        origins: ["*:*"],
        entropy: 590363477
    }));
};

var request = function(req, res) {
    var clientId = parseRequest(req.url).clientId;
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.writeHead(200);

    if(clientId in clients) {
        clients[clientId].connection = res;
    } else {
        clients[clientId] = {};
        res.end('o\n');
    }
};

var parseRequest = function(url) {
    var params = url.split('/');
    var length = params.length;

    return {
        clientId: params[length - 2],
        method: params[length - 1]
    };
};

console.log(' [*] Listening on 0.0.0.0:10000' );
server.listen(10000, '0.0.0.0');
