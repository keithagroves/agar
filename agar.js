var _ = require('lodash');
var WebSocket = require('ws');
var request = require('request');
var Message = require('./Message');

/**
 * getServerList
 *
 * Results is like:
 *
 * {
 *   "regions": {
 *     "US-Fremont": {
 *       "numPlayers": 5735,
 *       "numRealms": 42,
 *       "numServers": 14
 *     },
 *     ...
 *   },
 *   "totals": {
 *     "numPlayers": 28668,
 *     "numRealms": 229,
 *     "numServers": 81
 *   }
 * }
 *
 * @param {function(error, results)} callback
 */
function getServerList(callback) {
  request('http://m.agar.io/info', function(error, res, body) {
    if (error)
      return callback(error);

    var servers = JSON.parse(body);
    callback(null, body);
  });
}

function Session() {
  _.bindAll(this);
  this.region = null;
}

Session.prototype.connect = function connect(callback) {
  var self = this;
  // TODO(ibash) test to make sure region is operating correctly
  var region = this.region || '?';
  var form = {};
  form[region] = '';

  request.post({url: 'http://m.agar.io/', form: form}, function(error, res, body) {
    if (error)
      return callback(error);

    var ips = body.split('\n');
    console.log('connecting to: ', 'ws://' + ips[0]);
    self.socket = new WebSocket('ws://' + ips[0], {origin: 'http://agar.io'});
    self.socket.on('open', self.onSocketOpen);
    self.socket.on('close', self.onSocketClose);
    self.socket.on('error', self.onSocketError);
    self.socket.on('message', self.onSocketMessage);
    self.socket.on('unexpected-response', self.onSocketUnexpectedResponse);
    self.socket.on('ping', self.onSocketPing);
    self.socket.on('pong', self.onSocketPong);
  });
};

Session.prototype.setRegion = function setRegion(region) {
  this.region = region;
};

Session.prototype.onSocketOpen = function onSocketOpen() {
  var message = new ArrayBuffer(5);
  var view = new DataView(message);
  view.setUint8(0, 255);
  view.setUint32(1, 1, true);
  this.socket.send(message, {binary: true, mask: true});
};

Session.prototype.onSocketClose = function onSocketClose() {
  console.log('got on socket close');
  console.log(JSON.stringify(arguments, null, 2));
};

Session.prototype.onSocketError = function onSocketError(error) {
  console.log('Socket error: ', error.message);
};

Session.prototype.onSocketMessage = function onSocketMessage(data, flags) {
  var message = new Message(data);
  message.parse();
};

Session.prototype.onSocketUnexpectedResponse = function onSocketUnexpectedResponse() {
  console.log('got on socket unexpected response');
  console.log(JSON.stringify(arguments, null, 2));
};

Session.prototype.onSocketPing = function onSocketPing() {
  console.log('got socket ping');
  console.log(JSON.stringify(arguments, null, 2));
};

Session.prototype.onSocketPong = function onSocketPong() {
  console.log('got socket pong');
  console.log(JSON.stringify(arguments, null, 2));
};

// testing
s = new Session();
s.setRegion('US-Fremont');
s.connect();
