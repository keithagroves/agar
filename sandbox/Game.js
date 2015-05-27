/**
 * Represents a single game play session.
 */

var _ = require('lodash');
var WebSocket = require('ws');
//var Agent = require('./Agent');
//var Controller = require('./Controller');
//var Message = require('./Message');

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

  this.client.on('message', this.onClientMessage);
  this.client.on('close', this.onClientClose);

  this.backend.on('open', this.onBackendOpen);
  this.backend.on('message', this.onBackendMessage);
  this.backend.on('close', this.onBackendClose);
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

  /*
  var message = new Message(data);
  var parsed = message.parse();
  if (message.getType() === Message.TYPES.POSITION) {
    console.log(parsed);
  }
 */
};

Game.prototype.onBackendClose = function onBackendClose() {
  console.log('backend disconnected');
  this.client.close();
  //this.agent.stop();
};
