//
// The internal WebSocket wrapping interface. You should never need to access
// this directly from p5.js sketches.
//
import EventEmitter3 from "eventemitter3";

function tryParse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    return data;
  } catch (ex) {
    if (window.WS_DEBUG) {
      console.error(
        "[p5.websocket error] failed to parse data blob as JSON:",
        data
      );
    }
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
      if (window.WS_DEBUG) console.log("[WebSocketClient on open]");
      self.onopen();
    };

    this.instance.onclose = function (evt) {
      if (window.WS_DEBUG) console.log("[WebSocketClient on close]");
      switch (evt.code) {
        case 1000: // CLOSE_NORMAL
          if (window.WS_DEBUG) console.log("WebSocketClient: closed");
          break;
        default:
          // Abnormal closure
          self.reconnect(evt);
          break;
      }
      if (self.onclose) self.onclose(evt);
    };

    this.instance.onerror = function (evt) {
      if (window.WS_DEBUG) console.log("[WebSocketClient on error]");
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
      if (window.WS_DEBUG) console.log("[WebSocketClient on message]");
      self.onmessage(evt.data);
    };

    if (window.WS_DEBUG) console.log("[WebSocketClient open] completed");
  }

  removeAllListeners() {
    this.instance.onopen = null;
    this.instance.onclose = null;
    this.instance.onerror = null;
    this.instance.onmessage = null;
  }

  reconnect() {
    if (window.WS_DEBUG)
      console.log(
        "WebSocketClient: retry in",
        this.reconnect_interval,
        "ms",
        evt
      );
    this.removeAllListeners();

    const self = this;
    setTimeout(function () {
      if (window.WS_DEBUG) console.log("WebSocketClient: reconnecting...");
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
      if (window.WS_DEBUG) {
        console.error("close failed", ex.message);
      }
    }
  }

  socketEvents.on("close", close);

  sock.onopen = function () {
    if (window.WS_DEBUG) console.log("socket connected");

    // external client-to-library API "methods"
    socketEvents.on("send", send);
  };

  sock.onclose = function () {
    if (window.WS_DEBUG) console.log("socket closed");
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
          if (window.WS_DEBUG) {
            console.log("[p5.websocket] receiving data", message);
          }
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
    if (data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = function () {
        handleDataString(reader.result);
      };
      reader.readAsText(data);
    } else if (typeof data == "string") {
      handleDataString(data);
    }
  };

  return socketEvents;
};
