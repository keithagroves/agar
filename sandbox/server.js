/**
 *
 * Server
 *
 * Proxies requests from agar backend server to modified client.
 * Allows controlling actions in agar via an agent.
 */
var express = require('express');
var WebSocket = require('ws');
var WebSocketServer = require('ws').Server;

var AGAR_SERVER = 'ws://23.239.23.225:443/';
var HTTP_PORT = 80;
var WEBSOCKET_PORT = 8080;

// Serve static assets.
var app = express();
app.use(express.static('public'));
app.listen(HTTP_PORT);

// Web socket proxy sever.
var wss = new WebSocketServer({port: WEBSOCKET_PORT});
wss.on('connection', function connection(ws) {
  console.log('Got websocket connection, proxying.');

  var initialIncomingBuffer = [];
  var out = new WebSocket(AGAR_SERVER, {origin: 'http://agar.io'});
  var isOutOpen = false;

  out.on('open', function() {
    isOutOpen = true;
    while (initialIncomingBuffer.length) {
      out.send(initialIncomingBuffer.pop());
    }
  });

  ws.on('message', function(message) {
    if (isOutOpen) {
      out.send(message);
    } else {
      initialIncomingBuffer.push(message);
    }
  });

  out.on('message', function(message) {
    ws.send(message);
  });
});

console.log('Proxy server started on port: ' + HTTP_PORT);
