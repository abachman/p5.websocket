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

`onConnection`

`onDisconnection`

`connectReceived(uid)`

`disconnectReceived(uid)`

`messageReceived(data)`

## Hacking

Clone this repository and run `yarn install`.

Then run `yarn dev`.

serve `example-dist/` as static

## Other Stuff

Check out [the p5.websocket reference server](https://github.com/abachman/p5-websocket-server/).
