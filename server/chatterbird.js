var path  = require('path'),
    fs    = require('fs'),
    http  = require('http');

var Server = require('./server');

var config = require(process.argv[2]);
var serverName = process.argv[3];

var PUBLIC_DIR = path.dirname(__filename) + '/../';

var httpServer = http.createServer(function() {});

var server = new Server(config, serverName);

var responseHeaders = {'Content-Type': 'application/json', 'Server': 'Apache/2.3.16 (Unix) OpenSSL/1.0.0c',
          'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': -1}

httpServer.addListener('request', function(request, response) {
  var path = request.url;

  if(path.search('/test/') === 0 || path.search('/build/') === 0) {
    fs.readFile(PUBLIC_DIR + path, function(err, content) {
      var status = err ? 404 : 200;
      response.writeHead(status);
      response.write(content || 'Not found');
      response.end();
    });
  }
  else {
    handle(request, response);
  }
});

httpServer.listen(config[serverName].port);

function handle(request, response) {
  var requestMethod = request.method;

  if (requestMethod === 'POST') {
    return waitForPostData(request, function(data) {

      try {
        var messages = JSON.parse(data);

        server.process(messages, function(replies) {
          response.writeHead(200, responseHeaders);
          response.write(replies);
          response.end();
        }, this);
      }
      catch(e) {
        _returnError(response);
      }
    });
  } else {
    _returnError(response);
  }
}

function waitForPostData(request, callback) {
  var _content = '';

  request.addListener('data', function(chunk) {
    _content += chunk;
  });

  request.addListener('end', function() {
    callback(_content);
  });
}

function _returnError(response) {
  response.writeHead(400, responseHeaders);
  response.write('Bad request');
  response.end();
}