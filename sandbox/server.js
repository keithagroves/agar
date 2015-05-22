/**
 *
 * Server
 *
 * Proxies requests from agar backend server to modified client.
 * Allows controlling actions in agar via an agent.
 */
var express = require('express');
var WebSocketServer = require('ws').Server;
var Game = require('./Game');

var HTTP_PORT = 8888;
var WEBSOCKET_PORT = 8080;

// Serve static assets.
var app = express();
app.use(express.static('public'));
app.listen(HTTP_PORT);

// Web socket proxy sever.
var wss = new WebSocketServer({port: WEBSOCKET_PORT});
wss.on('connection', function connection(client) {
  console.log('Got websocket connection, initializing game.');
  new Game(client);
});

console.log('Proxy server started on port: ' + HTTP_PORT);
