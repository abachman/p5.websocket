import EventEmitter3 from "eventemitter3";

window.DEBUG = false;

class WebSocketClient {
  constructor() {
    this.reconnect_interval = 1500;
  }

  open(url) {
    this.url = url;
    this.instance = new WebSocket(this.url);

    var self = this;

    this.instance.onopen = function () {
      if (window.DEBUG) console.log("[WebSocketClient on open]");
      self.onopen();
    };

    this.instance.onclose = function (evt) {
      if (window.DEBUG) console.log("[WebSocketClient on close]");
      switch (evt.code) {
        case 1000: // CLOSE_NORMAL
          if (window.DEBUG) console.log("WebSocketClient: closed");
          break;
        default:
          // Abnormal closure
          self.reconnect(evt);
          break;
      }
      if (self.onclose) self.onclose(evt);
    };

    this.instance.onerror = function (evt) {
      if (window.DEBUG) console.log("[WebSocketClient on error]");
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
      if (window.DEBUG) console.log("[WebSocketClient on message]");
      self.onmessage(evt.data);
    };

    if (window.DEBUG) console.log("[WebSocketClient open] completed");
  }

  removeAllListeners() {
    this.instance.onopen = null;
    this.instance.onclose = null;
    this.instance.onerror = null;
    this.instance.onmessage = null;
  }

  reconnect() {
    if (window.DEBUG)
      console.log(
        "WebSocketClient: retry in",
        this.reconnect_interval,
        "ms",
        evt
      );
    this.removeAllListeners();

    var self = this;
    setTimeout(function () {
      if (window.DEBUG) console.log("WebSocketClient: reconnecting...");
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

export const startWebsocket = (url, callback) => {
  const socketEvents = new EventEmitter3();
  const sock = new WebSocketClient(socketEvents);

  sock.open(url);

  function send(message) {
    sock.send(message);
  }

  sock.onopen = function () {
    console.log("socket connected");
    socketEvents.on("send", send);
  };

  sock.onclose = function () {
    console.log("socket closed");
    socketEvents.removeListener("send", send);
  };
  sock.onerror = sock.onclose;

  function handleDataString(data) {
    var message = JSON.parse(data);
    if (callback) {
      callback(message);
    } else {
      socketEvents.emit("data.*", message);
      if (message.key) {
        socketEvents.emit("data." + message.key, {
          key: message.key,
          value: message.value,
          created_at: message.created_at,
          mode: message.mode ? message.mode : "live",
        });
      } else {
        socketEvents.emit("data", message);
      }
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
