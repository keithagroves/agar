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

var AGAR_SERVER = 'ws://45.79.94.67:443/';
var HTTP_PORT = 8888;
var WEBSOCKET_PORT = 8080;

// Serve static assets.
var app = express();
app.use(express.static('public'));
app.listen(HTTP_PORT);

// Web socket proxy sever.
var wss = new WebSocketServer({port: WEBSOCKET_PORT});
wss.on('connection', function connection(client) {
  console.log('Got websocket connection, proxying.');

  var initialIncomingBuffer = [];
  var backend = new WebSocket(AGAR_SERVER, {origin: 'http://agar.io'});

  backend.on('open', function() {
    while (initialIncomingBuffer.length) {
      backend.send(initialIncomingBuffer.pop());
    }
  });

  client.on('message', function(message) {
    //console.log('received: %s', message.toString('hex'));
    if (backend.readyState === WebSocket.OPEN) {
      backend.send(message);
    } else if (backend.readyState === WebSocket.CONNECTING) {
      initialIncomingBuffer.push(message);
    }
  });

  backend.on('message', function(message) {
    //console.log('wrote: %s', message.toString('hex'));
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  client.on('close', function() {
    console.log('client disconnected');
    backend.close();
  });

  backend.on('close', function() {
    console.log('backend disconnected');
    client.close();
  });
});

console.log('Proxy server started on port: ' + HTTP_PORT);
