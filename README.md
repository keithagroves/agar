# Agar

Contains some code to interact with the game agar.io.
In scratch you'll find some experimental files.

- `scratch/agar.js` is a node.js file that will connect to the backend agar
  server and decode messages using `scratch/Message.js`.
- `scratch/Message.js` contains a partial implementation that decodes the binary
  messages from the agar.io server.
- `scratch/main.js` and `scratch/main2.js` contain partially un-minfied versions
  of the agar.io client. Agar is continually being improved and `main2` is a
  newer version of the game client. Note that both might be out of date /
  non-functioning, they are more for understanding how the client works.
- `scratch/proxy` contains a node.js web server. The server serves a modified
  version of the agar.io client that will connect to the node.js server
  websocket. The node.js server will then proxy websocket messages to the actual
  agar.io server. You can play the game and observe / intercept / modify the
  binary messages being sent back and forth.
