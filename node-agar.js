var _ = require('lodash');
var WebSocket = require('ws');
var request = require('request');

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

// TODO(ibash) make a game parser module...
Session.prototype.onSocketMessage = function onSocketMessage(data, flags) {
  //console.log('got on socket message');
  //console.log(JSON.stringify(arguments, null, 2));
  //console.log(typeof data);
  //console.log(Object.keys(data));
  //console.log(data);
  var view =  new DataView(toArrayBuffer(data));
      console.log(view.getUint8(0));
  switch (view.getUint8(0)) {
    case 16:
      //TODO(ibash) parse player message
      this.parsePlayerMessage(view);
      break;
    //case 20:
      // TODO(ibash) reset
        //n = [];
        //D = [];
        //break;
    //case 32:
      // TODO(ibash) ???
        //D.push(f.getUint32(1, true));
        //break;
    case 48:
      // TODO(ibash) this
      break;
    case 49:
      this.parseLeaderBoard(view);
      break;
        /*
      case 64:
          X = f.getFloat64(1, true), Y = f.getFloat64(9, true), Z = f.getFloat64(17, true), $ = f.getFloat64(25, true), 0 == n.length && (x = (Z + X) / 2, y = ($ + Y) / 2)
      */
  }
};

Session.prototype.parseLeaderBoard = function parseLeaderBoard(view) {
  var leaders = [];
  var count = view.getUint32(1, true);
  var offset = 5;
  for (var i = 0; i < count; i++) {
    var id = view.getUint32(offset, true);
    offset += 4;
    leaders.push({
      id: id,
      name: parseName()
    })
  }

  function parseName() {
    var name = '';
    while (true) {
      var charCode = view.getUint16(offset, true);
      offset += 2;
      if (charCode === 0) break;
      name += String.fromCharCode(charCode)
    }

    return name;
  }

  console.log(leaders);
};

Session.prototype.parsePlayerMessage = function parsePlayerMessage(view) {
  var offset = 1;

  // TODO(ibash) I think the first for loop below is for one player eating
  // another...
  var count = view.getUint16(offset, true);
  offset += 2;
  console.log('count for destroying: ', count);
  for (var i = 0; i < count; i++) {
    var id1 = view.getUint32(offset, true);
    var id2 = view.getUint32(offset + 4, true);
    offset += 8;

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
  }

  // Parse the rest of the players
  while (true) {
    var id = view.getUint32(offset, true);
    offset += 4;

    // Done processing this message...
    if (id === 0) {
      break;
    }

    var x = view.getFloat64(offset, true),
    offset += 8;
    var y = view.getFloat64(offset, true),
    offset += 8;
    var size = view.getFloat64(offset, true),
    offset += 8;
    var color = view.getUint8(offset),
    offset += 1;
    var isVirus = false;
    if (color === 0) {
      isVirus = true;
      // TODO(ibash) set a default color for the virus
    } else if (color === 255) {
      // TODO(ibash) I think it's parsing the color for a food item
      var red = view.getUint8(offset);
      offset += 1;
      var green = view.getUint8(offset);
      offset += 1;
      var blue = view.getUint8(offset);
      offset += 1;
      color = numberToColorHex(red << 16 | green << 8 | blue);

      // TODO(ibash) unsure what this is doing...
      var g = view.getUint8(offset);
      offset += 1;
      var h = !!(g & 1);
      if (g & 2) {
        offset += 4;
      }
      if (g & 4) {
        offset += 8;
      }
      if (g & 8) {
        offset += 16;
      }
    } else {
      // TODO(ibash) some more complicated stuff to parse the color for the
      // player
    }

    // TODO(ibash) parse the name
  }
};

function numberToColorHex(number) {
  var color = number.toString(16);
  
  while (color.length < 6) {
    color = '0' + color;
  }

  return '#' + color;
}

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

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

// testing
s = new Session();
s.setRegion('US-Fremont');
s.connect();

