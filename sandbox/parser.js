/**
 * Parser
 *
 * Parser for agar.io messages.
 */
var Parser = require('binary-parser').Parser;

// Parses a single leader board entry.
var leaderBoardParser = new Parser()
  .uint32le('id')
  .string('name', {
    // TODO(ibash) verify encoding
    encoding: 'utf8',
    zeroTerminated: true
  });

// Parses the leader board.
var leaderBoardParser = new Parser()
  .uint32le('dataLength')
  .array('leaderBoard', {
    type: leaderBoardEntryParser,
    length: 'dataLength'
  });

// Top level message parser.
var message = new Parser()
  .uint8('type')
  .choice('data', {
    tag: 'type',
    choices: {
      // Reset
      //20:
      // Leader board
      49: leaderBoardParser
      // Initial screen position
      //64: 
    }
  });

module.exports = function parse(buffer) {
  console.log(JSON.stringify(message.parse(buffer), null, 2));
};
