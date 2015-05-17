var MESSAGE_TYPES = {
  ELEMENTS: 16, // ???
  DUNNO: 17, // ???
  RESET: 20, // ???
  DUNNO: 32, // ???
  LEADER_BOARD: 49, // ???
  DUNNO: 64
};

function Message(data) {
  this.data = data;
  this.view = new DataView(toArrayBuffer(data));
  this.offset = 0;
  this.isParsed = false;
};
module.exports = Message;

Message.prototype.parse = function parse() {
  if (this.isParsed) {
    throw new Error('Can only call message.parse once');
  }
  this.isParsed = true;
  var type = this.view.getUint8(0);
  this.offset += 1;

  switch (type) {
    case MESSAGE_TYPES.ELEMENTS:
      this.parseElements();
      break;
    case MESSAGE_TYPES.RESET:
      console.log('got reset');
      //this.parseReset();
      break;
    case MESSAGE_TYPES.DUNNO:
      console.log('i dunno');
      break;
    case MESSAGE_TYPES.LEADER_BOARD:
      this.parseLeaderBoard();
      break;
  }
};

Message.prototype.parseElements = function parseElements() {
  this.parseMaybeEaten();

  while (this.view.getUint32(this.offset, true) !== 0) {
    this.parseElement();
  }
  // +4 for the last id (0) we got
  this.offset += 4;

  // Another padding byte...
  this.view.getUint16(this.offset, true);
  this.offset += 2;

  this.parseAlive();
};

// TODO(ibash) don't know if this is actually destroyed or soemthing else...?
Message.prototype.parseMaybeEaten = function parseMaybeEaten() {
  var eatens = [];

  var count = this.view.getUint16(this.offset, true);
  this.offset += 2;
  for (var i = 0; i < count; i++) {
    var id1 = this.view.getUint32(this.offset, true);
    this.offset += 4;
    var id2 = this.view.getUint32(this.offset, true);
    this.offset += 4;

    // TODO(ibash) player with id2 is destroyed
    // In the below code, e is the player object for id1 and t is the player
    // object for id2 ...
    //if (id1 && id2) {
      //t.destroy();
      //t.ox = t.x;
      //t.oy = t.y;
      //t.oSize = t.size;
      //t.nx = e.x;
      //t.ny = e.y;
      //t.nSize = t.size;
      //t.updateTime = F;
    //}
    console.log('id1, id2', id1, id2);
    eatens.push([id1, id2]);
  }

  return eatens;
};

Message.prototype.parseElement = function parseElement() {
  var id = this.view.getUint32(this.offset, true);
  this.offset += 4;
  var x = this.view.getFloat32(this.offset, true);
  this.offset += 4;
  var y = this.view.getFloat32(this.offset, true);
  this.offset += 4;
  var size = this.view.getFloat32(this.offset, true);
  this.offset += 4;

  var color = this.parseColor();

  var flags = this.view.getUint8(this.offset);
  this.offset += 1;
  var isVirus = !!(flags & 1);
  var isAgitated = !!(flags & 16);

  // TODO(ibash) don't undestand this offsetting here, but it's in the
  // original code
  if (flags & 2) {
    this.offset += 4;
  }
  if (flags & 4) {
    this.offset += 8;
  }
  if (flags & 8) {
    this.offset += 16;
  }

  var name = this.parseName();

  console.log({id: id, x: x, y: y, size: size, color: color, isVirus: isVirus, isAgitated: isAgitated, name: name});
};

Message.prototype.parseAlive = function parseAlive() {
  var countAlive = this.view.getUint32(this.offset, true);
  this.offset += 4;

  for (var i = 0; i < countAlive; i++) {
    var id = this.view.getUint32(this.offset, true);
    this.offset += 4;
    console.log('alive', id);
  }

  // TODO(ibash) at this point in the code they remove everyone who is not alive
};


Message.prototype.parseColor = function parseColor() {
  var red;
  var green;
  var blue;
  var number;
  var color;

  red = this.view.getUint8(this.offset);
  this.offset += 1;
  green = this.view.getUint8(this.offset);
  this.offset += 1;
  blue = this.view.getUint8(this.offset);
  this.offset += 1;

  number = red << 16 | green << 8 | blue;
  color = number.toString(16);

  while (color.length < 6) {
    color = '0' + color;
  }

  return '#' + color;
};

Message.prototype.parseLeaderBoard = function parseLeaderBoard() {
  var leaders = [];
  var count = this.view.getUint32(this.offset, true);
  this.offset += 4;
  for (var i = 0; i < count; i++) {
    var id = this.view.getUint32(this.offset, true);
    this.offset += 4;
    leaders.push({
      id: id,
      name: this.parseName()
    })
  }

  // TODO(ibash) do something with leaders;
  console.log(leaders);
  return leaders;
};

Message.prototype.parseName = function parseName() {
  var name = '';

  while (true) {
    var charCode = this.view.getUint16(this.offset, true);
    this.offset += 2;
    if (charCode === 0) break;
    name += String.fromCharCode(charCode)
  }

  return name;
};

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}
