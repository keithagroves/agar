/**
 * Controls the player.
 *
 * Useage:
 *
 * var controller = new Controller(backend);
 * controller.split();
 * controller.ejectMass();
 */

var WebSocket = require('ws');

var COMMANDS = {
  SPLIT: 17,
  EJECT_MASS: 21
  // 18 / 19 seem like they could be to clear the last action? I'm not entirely
  // sure, they're mapped to a keypress of the q key and 19 is also mapped to an onblur
  QUIT: 18,
  CLEAR: 19
};

/**
 * Controller
 *
 * @param {WebSocket} backend Connection to backend agar.io server for this
 *   player.
 * @return {Controller}
 */
function Controller(backend) {
  this.backend = backend;
}
module.exports = Controller;

Controller.prototype.split = function split() {
  this.sendCommand(COMMANDS.SPLIT);
};

Controller.prototype.ejectMass = function ejectMass() {
  this.sendCommand(COMMANDS.EJECT_MASS);
};

Controller.prototype.sendCommand = function sendCommand(command) {
  if (this.backend.readyState !== WebSocket.OPEN) {
    throw new Error('Backend not connected');
    return;
  }

  var buffer = new ArrayBuffer(1);
  var view = new DataView(buffer);
  buffer.setUint8(0, command);
  this.backend.send(buffer)
}

/**
 * sendMousePosition
 *
 * Sends position of mouse relative to origin.
 * x and y should range from ~ -350 to +350, tested emprically.
 *
 * @param {number} x X Position to send to backend
 * @param {number} y Y Position to send to backen
 */
Controller.prototype.sendMousePosition = function sendMousePosition(x, y) {
  if (this.backend.readyState !== WebSocket.OPEN) {
    throw new Error('Backend not connected');
    return;
  }

  if (64 > x * x + y * y) {
    // Not sure what this is guarding against... possibly just the mouse being
    // on the player itself.
    return;
  }
  if (this.lastMouseX === x && this.lastMouseY === y) {
    // No position change.
    return;
  }

  this.lastMouseX = x;
  this.lastMouseY = y;
  buffer = new ArrayBuffer(21);
  view = new DataView(buffer);
  view.setUint8(0, 16);
  view.setFloat64(1, x, true);
  view.setFloat64(9, y, true);
  view.setUint32(17, 0, true);
  this.backend.send(buffer);
};
