## 1.1.2

- add `close` message to socket lib to allow forcefully closing connections
- small, functionality-preserving changes to support testing

## 1.1.1

- server added second "onopen" notification when p5.websocket clients connect
- onConnection receives uid of self
- messageReceived now accepts an additional `uid` argument

## 1.1.0

- wrap all messages in additional JSON package
- add event notifications for connections and disconnections
- add configuration options to the connection URL

## 1.0.0

Initial commit. Do all the initial stuff.
