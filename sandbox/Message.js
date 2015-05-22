/**
 * Parses messages from agar.io backend.
 *
 * Useage:
 *
 * var message = new Message(buffer);
 * message.parse();
 */

var TYPES = {
  POSITION: 64
};

/**
 * Message
 *
 * @param {Buffer} data
 * @return {Message}
 */
function Message(data) {
  this.data = data;
  this.view = new DataView(toArrayBuffer(data));
  this.offset = 0;
  this.isParsed = false;
};
module.exports = Message;
module.exports.TYPES = TYPES;

Message.prototype.getType = function getType() {
  return this.type;
};

Message.prototype.parse = function parse() {
  if (this.isParsed) {
    throw new Error('Can only call message.parse once');
  }
  this.isParsed = true;
  this.type = this.view.getUint8(0);
  this.offset += 1;

  switch (this.type) {
    case TYPES.POSITION:
      return this.parsePosition();
      break;
  }
};

Message.prototype.parsePosition = function parsePosition() {
  var T = this.view.getFloat64(1, true);
  var U = this.view.getFloat64(9, true);
  var V = this.view.getFloat64(17, true);
  var W = this.view.getFloat64(25, true);
  var K = (V + T) / 2;
  var L = (W + U) / 2;
  var M = 1;
  return {
    T: T,
    U: U,
    V: V,
    W: W,
    K: K,
    L: L,
    M: M
  };
};

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}
