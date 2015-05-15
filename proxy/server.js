var express = require('express');
var WebSocket = require('ws');
var WebSocketServer = require('ws').Server;

// Serve static assets.
var app = express();
app.use(express.static('public'));
app.listen(80);

// Web socket proxy sever.
var wss = new WebSocketServer({port: 8080});
wss.on('connection', function connection(ws) {
  console.log('got connection');

  var initialIncomingBuffer = [];
  var out = new WebSocket('ws://23.239.23.225:443/', {origin: 'http://agar.io'});
  var isOutOpen = false;

  out.on('open', function() {
    isOutOpen = true;
    while (initialIncomingBuffer.length) {
      out.send(initialIncomingBuffer.pop());
    }
  });

  ws.on('message', function(message) {
    console.log('received: %s', message.toString('hex'));
    if (isOutOpen) {
      out.send(message);
    } else {
      initialIncomingBuffer.push(message);
    }
  });

  out.on('message', function(message) {
    console.log('wrote: %s', message.toString('hex'));
    ws.send(message);
  });
});

console.log('proxy started');
