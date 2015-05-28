/**
 * Parser
 *
 * Parser for agar.io messages.
 */
var Parser = require('binary-parser').Parser;

var noop = new Parser();

// Parses a string via String.fromCharCode
var string = new Parser()
  .array('string', {
    type: 'uint16le',
    readUntil: function(item, buffer) { return item === 0; },
    formatter: function(codes) {
      // Remove the null character
      codes.pop();
      var characters = codes.map(function(code) {
        return String.fromCharCode(code);
      });
      return characters.join('');
    }
  });

var color = new Parser()
  .uint8('r')
  .uint8('g')
  .uint8('b');

var consumption = new Parser()
  .uint32le('consumerId')
  .uint32le('consumedId')

var positionEntry = new Parser()
  .uint32le('id')
  .choice('data', {
    tag: 'id',
    choices: {0: noop},
    defaultChoice: new Parser()
      .floatle('nX')
      .floatle('nY')
      .floatle('nSize')
      .nest('color', {type: color})
      .uint8('flags')
      .nest('name', {type: string})
  });

var updates = new Parser()
  .uint16le('length')
  .array('consumptions', {
    type: consumption,
    length: 'length'
  })
  .array('positions', {
    type: positionEntry,
    readUntil: function(item, buffer) { return item.id === 0; },
    formatter: function(updates) {
      // Remove the last "update" entry, it is a marker for end of array
      updates.pop();
      return updates;
    }
  })
  // In the original code they skip a uint16le
  .skip(2)
  .uint32le('length')
  .array('pings', {
    type: 'uint32le',
    length: 'length'
  });

var userId = new Parser()
  .uint32le('id');

// Parses a single leader board entry.
var leaderBoardEntry = new Parser()
  .uint32le('id')
  .nest('name', {type: string});

// Parses the leader board.
var leaderBoard = new Parser()
  .uint32le('length')
  .array('leaderBoard', {
    type: leaderBoardEntry,
    length: 'length'
  });

var boardSize = new Parser()
  .doublele('minX')
  .doublele('minY')
  .doublele('maxX')
  .doublele('maxY');

var dontKnowYet = new Parser()
  .uint32le('length')
  .array('dontKnowYet', {
    type: 'floatle',
    length: 'length'
  });

var screenPosition = new Parser()
  .floatle('x')
  .floatle('y')
  .floatle('z');

// Top level message parser.
var message = new Parser()
  .uint8('type')
  .choice('data', {
    tag: 'type',
    choices: {
      // TODO(ibash) use type constants below instead of numbers here
      16: updates,
      17: screenPosition,
      // Reset
      20: noop,
      32: userId,
      49: leaderBoard,
      // Not sure what this is yet -- might be ids?
      50: dontKnowYet,
      64: boardSize
    },
    defaultChoice: noop
  });

module.exports = message;
module.exports.TYPES = {
  UPDATES: 16,
  USER_ID: 32
};
