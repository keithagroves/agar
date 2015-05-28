/**
 * Represents a single game play session.
 */

var _ = require('lodash');
var WebSocket = require('ws');
//var Agent = require('./Agent');
//var Controller = require('./Controller');
//var Message = require('./Message');
var parser = require('./parser');

var AGAR_SERVER = 'ws://45.79.73.78:443/';

/**
 * Game
 *
 * @param {WebSocket} client Connection of the user to proxy.
 * @return {Game}
 */
function Game(client) {
  _.bindAll(this);
  this.client = client;
  this.backend = new WebSocket(AGAR_SERVER, {origin: 'http://agar.io'});
  this.initialIncomingBuffer = [];
  this.currentUserId = null;
  this.players = {};

  this.client.on('message', this.onClientMessage);
  this.client.on('close', this.onClientClose);

  this.backend.on('open', this.onBackendOpen);
  this.backend.on('message', this.onBackendMessage);
  this.backend.on('close', this.onBackendClose);

  this.drawLoop();

}
module.exports = Game;

/*
Game.prototype.playGame = function playGame() {
  if (this.isPlayed) {
    throw new Error('Playing the same game twice');
  }
  this.isPlayed = true;

  // Initialize a new agent to play the game.
  var controller = new Controller(this.backend);
  this.agent = new Agent(controller);
  this.agent.run();
};
*/

Game.prototype.onClientMessage = function onClientMessage(data) {
  //console.log('client  -> backend: %s', data.toString('hex'));

  // Detect game start (i.e. clicking the "play" button). The data will have a 0
  // for the first byte.
  //if (data[0] === 0){
    //this.playGame();
  //}

  if (this.backend.readyState === WebSocket.OPEN) {
    this.backend.send(data);
  } else if (this.backend.readyState === WebSocket.CONNECTING) {
    this.initialIncomingBuffer.push(data);
  }
};

Game.prototype.onClientClose = function onClientClose() {
  console.log('client disconnected');
  this.backend.close();
  //this.agent.stop();
};

Game.prototype.onBackendOpen = function onBackendOpen() {
  while (this.initialIncomingBuffer.length) {
    this.backend.send(this.initialIncomingBuffer.pop());
  }
};

Game.prototype.onBackendMessage = function onBackendMessage(data) {
  //console.log('backend -> client: %s', data.toString('hex'));
  if (this.client.readyState === WebSocket.OPEN) {
    this.client.send(data);
  }

  var message = parser.parse(data);
  if (message.type === parser.TYPES.USER_ID) {
    this.currentUserId = message.data.id
  } else if (message.type === parser.TYPES.UPDATES) {
    this.processUpdates(message.data);
  }
};

Game.prototype.onBackendClose = function onBackendClose() {
  console.log('backend disconnected');
  this.client.close();
  //this.agent.stop();
};
 
Game.prototype.processUpdates = function processUpdates(updates) {
  // There are 3 types of data on the updates:
  // consumptions: Not exactly sure what this is yet, but I think it's when one
  //   player eats another
  // positions: Current position / size of players
  // pings: Player ids that are still alive / should be kept alive
  //
  // If an update comes in, and an id is not included in positions or pings then
  // we assume that the player is gone (they are either off screen or don't
  // exist anymore).

  var self = this;
  var newPlayers = {};

  _.each(updates.consumptions, function(consumption) {
    if (self.players[consumption.consumedId]) {
      delete self.players[consumption.consumedId];
    }
  });

  _.each(updates.positions, function(position) {
    newPlayers[position.id] = position;
  });

  _.each(updates.pings, function(id) {
    if (self.players[id]) {
      newPlayers[id] = self.players[id];
    }
  });

  this.players = newPlayers;
};

Game.prototype.drawLoop = function drawLoop() {
  this.draw();
  setTimeout(this.drawLoop.bind(this), 500);
};

Game.prototype.draw = function draw() {
  //var lines = process.stdout.getWindowSize()[1];
  //for(var i = 0; i < lines; i++) {
    //console.log('\r\n');
  //}

  var gnuplot = require('child_process').spawn('gnuplot');
  gnuplot.stdin.write('set term dumb\n');
  gnuplot.stdin.write("plot '-'\n");
  _.each(this.players, function(player) {
    gnuplot.stdin.write(player.data.nX + ' ' + player.data.nY + '\n');
  });
  gnuplot.stdin.write('e\n');

  gnuplot.stdout.on('data', function(chunk) {
    console.log(chunk.toString('utf8'));
  });
}; 
