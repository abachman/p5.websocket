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

    var self = this;

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

    var self = this;
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
}

export const startWebsocket = (url) => {
  const socketEvents = new EventEmitter3();
  const sock = new WebSocketClient(socketEvents);

  sock.open(url);

  function send(message) {
    sock.send(message);
  }

  sock.onopen = function () {
    if (window.WS_DEBUG) console.log("socket connected");
    socketEvents.on("send", send);
  };

  sock.onclose = function () {
    if (window.WS_DEBUG) console.log("socket closed");
    socketEvents.removeListener("send", send);
    socketEvents.emit("onclose");
  };
  sock.onerror = sock.onclose;

  function handleDataString(data) {
    var message = JSON.parse(data);

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
          if (window.WS_DEBUG)
            console.log("[p5.websocket] receiving data", message);
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
      var reader = new FileReader();
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
