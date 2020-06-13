A (moderately) simple p5.js library for connecting to websocket servers like the one at https://p5-websocket.glitch.me/.

## Using p5.websocket

There's an example sketch at [`examples/sketch.js`](https://github.com/abachman/p5.websocket/blob/master/example/sketch.js)

First, download dist/p5.websocket.min.js and add it to your sketch's index.html file or use a CDN (content delivery network) to get the code straight from GitHub:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/npm/p5@1.0.0/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/abachman/p5.websocket/dist/p5.websocket.min.js"></script>
    <script src="sketch.js"></script>
  </head>
  <body></body>
</html>
```

A simple sketch that communicates with other sketches must include at least three things, a single call to `connectWebsocket` in the sketch setup, a user defined function `messageReceived`, and calls to `sendMessage` wherever you want your sketch to send data.

```js
let myColor = [100, 100, 100];

function setup() {
  createCanvas(200, 200);
  noStroke();
  // connect to the chat.reasonable.systems p5 websocket server on the channel
  // named "p5.websocket-example". Every sketch on the same channel will get
  // messages from this sketch.
  connectWebsocket("wss://chat.reasonable.systems/p5.websocket-example");
}

function draw() {
  background(255);
  fill(myColor);
  ellipse(width / 2, height / 2, width);
}

function mousePressed() {
  // send a message on the connected channel
  sendMessage({ color: [random(255), random(255), random(255)] });
}

// receive a message on the connected channel
function messageReceived(data) {
  myColor = data.color;
}
```

You can [play with a copy of this sketch here](https://editor.p5js.org/abachman-mica/sketches/nV1BOJomZ).

### Library Functions

`connectWebsocket(url, options)`

`sendMessage(message)`

### User Defined Functions

NOTE: `uid` in the functions below is the unique ID assigned to a given connection by p5-websocket-server.

`onConnection(uid)` when this sketch has finished connecting. The `uid` received is this sketch's own.

`onDisconnection` when this sketch has finished disconnecting. Usually only if the websocket server restarts or internet goes in-and-out.

`connectReceived(uid)` when another session connects.

`disconnectReceived(uid)` when another session disconnects.

`messageReceived(data, uid)` when a message is received from a session. If config includes `{ echo: true }` (the default) then the given sketch will receive its own messages.

## Contributing

Clone this repository and run `yarn install`.

Then run `yarn dev`.

Serve `example-dist/` as static.

## Other Stuff

Check out [the p5.websocket reference server](https://github.com/abachman/p5-websocket-server/).
