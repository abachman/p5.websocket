//
// The internal WebSocket wrapping interface. You should never need to access
// this directly from p5.js sketches.
//
import EventEmitter3 from "eventemitter3";
import Debug from "debug";

const debug = Debug('p5.websocket:socket');

function tryParse(jsonString) {
  debug('try parsing', jsonString);
  try {
    const data = JSON.parse(jsonString);
    return data;
  } catch (ex) {
    // expect that messages may be plain strings
    debug("failed to parse as JSON:", jsonString);
    return jsonString;
  }
}

class WebSocketClient {
  constructor() {
    this.reconnect_interval = 1500;
  }

  open(url) {
    this.url = url;
    this.instance = new WebSocket(this.url);

    const self = this;

    this.instance.onopen = function () {
      debug("[WebSocketClient on open]");
      self.onopen();
    };

    this.instance.onclose = function (evt) {
      debug("[WebSocketClient on close]");
      switch (evt.code) {
        case 1000: // CLOSE_NORMAL
          debug("WebSocketClient: closed");
          break;
        default:
          // Abnormal closure
          self.reconnect(evt);
          break;
      }
      if (self.onclose) self.onclose(evt);
    };

    this.instance.onerror = function (evt) {
      debug("[WebSocketClient on error]");
      switch (evt.code) {
        case "ECONNREFUSED":
          self.reconnect(evt);
          break;
        default:
          if (self.onerror) self.onerror(evt);
          break;
      }
    };

    this.instance.onmessage = function (evt) {
      debug("[WebSocketClient on message]");
      self.onmessage(evt.data);
    };

    debug("[WebSocketClient open] completed");
  }

  removeAllListeners() {
    this.instance.onopen = null;
    this.instance.onclose = null;
    this.instance.onerror = null;
    this.instance.onmessage = null;
  }

  reconnect(evt) {
    debug(
      "WebSocketClient: retry in",
      this.reconnect_interval,
      "ms",
      evt
    );
    this.removeAllListeners();

    const self = this;
    setTimeout(function () {
      debug("WebSocketClient: reconnecting...");
      self.open(self.url);
    }, this.reconnect_interval);
  }

  send(message) {
    if (typeof message === "string") {
      this.instance.send(message);
    } else {
      this.instance.send(JSON.stringify(message));
    }
  }

  // detach event listeners and close the socket
  close() {
    if (this.instance.readyState !== WebSocket.CLOSED) {
      this.instance.close();
    }
  }
}

export const startWebsocket = (url) => {
  const socketEvents = new EventEmitter3();
  const sock = new WebSocketClient(socketEvents);

  sock.open(url);

  function send(message) {
    sock.send(message);
  }

  function close() {
    try {
      sock.close();
    } catch (ex) {
      console.error("close failed", ex.message);
    }
  }

  socketEvents.on("close", close);

  sock.onopen = function () {
    debug("socket connected");

    // external client-to-library API "methods"
    socketEvents.on("send", send);
  };

  sock.onclose = function () {
    debug("socket closed");
    socketEvents.removeListener("send", send);
    socketEvents.removeListener("close", close);
    socketEvents.emit("onclose");
  };
  sock.onerror = sock.onclose;

  function handleDataString(data) {
    const message = JSON.parse(data);

    if (message.type) {
      switch (message.type) {
        case "onopen":
          socketEvents.emit("onopen", message.id);
          break;
        case "connect":
          socketEvents.emit("connect", message.id);
          break;
        case "disconnect":
          socketEvents.emit("disconnect", message.id);
          break;
        case "data":
          debug("receiving data", message);
          // try parsing data in case it's double-wrapped JSON
          let data = tryParse(message.data);
          socketEvents.emit("data", data, message.id);
          break;
      }
    } else {
      socketEvents.emit("data", message, message.id);
    }
  }

  sock.onmessage = function (data) {
    if (data instanceof Blob || data instanceof Buffer) {
      debug('message data is Blob || Buffer');
      const reader = new FileReader();
      reader.onload = function () {
        handleDataString(reader.result);
      };
      reader.readAsText(data);
    } else if (typeof data == "string") {
      debug('message data is string');
      handleDataString(data);
    }
  };

  return socketEvents;
};
