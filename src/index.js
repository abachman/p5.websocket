import { startWebsocket } from "./socket";

window.WS_DEBUG = false;

const p5 = window.p5;
let socket = null;

const defaultOptions = {
  echo: true,
  receiver: true,
  controller: true,
};

const serialize = (obj) => {
  return Object.keys(obj)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
    .join("&");
};

p5.prototype.connectWebsocket = function (url, options = {}) {
  const config = Object.assign({}, defaultOptions, options);
  const fullUrl = url + "?" + serialize(config);

  socket = startWebsocket(fullUrl);

  // console.log("CONNECTING WEBSOCKET WITH LOCAL THIS", this);
  // console.log(
  //   "can see methods from sketch here",
  //   this.hasOwnProperty("onConnection"),
  //   this.onConnection,
  //   window.onConnection
  // );

  // this client's connection
  socket.on("onopen", () => {
    if (window.onConnection) {
      onConnection();
    }
  });

  // this client's connection
  socket.on("onclose", () => {
    if (window.onDisconnection) {
      onDisconnection();
    }
  });

  // other clients' connections
  socket.on("connect", (message) => {
    if (window.connectReceived) {
      connectReceived(message);
    }
  });

  socket.on("disconnect", (message) => {
    if (window.disconnectReceived) {
      disconnectReceived(message);
    }
  });

  socket.on("data", (message) => {
    if (window.messageReceived) {
      messageReceived(message);
    }
  });
};

p5.prototype.sendMessage = (message) => {
  if (socket) {
    if (window.WS_DEBUG) console.log("sendin", message);
    socket.emit("send", message);
  }
};
