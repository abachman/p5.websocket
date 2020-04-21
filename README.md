A (moderately) simple p5.js library for connecting to websocket servers like the one at https://p5-websocket.glitch.me/.

Download dist/p5.websocket.min.js and add it to your sketch's index.html:

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

## Using p5.websocket

There's an example sketch at [`examples/sketch.js`](https://github.com/abachman/p5.websocket/blob/master/example/sketch.js)

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

## Hacking

Clone this repository and run `yarn install`.

Then run `yarn dev`.

serve `example-dist/` as static

## Other Stuff

Check out [the p5.websocket reference server](https://github.com/abachman/p5-websocket-server/).
