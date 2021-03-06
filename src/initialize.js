import { startWebsocket } from "./socket";
import { serialize } from "./utils";

export const initialize = (p5) => {
  let socket = null;

  const defaultOptions = {
    echo: true,
    receiver: true,
    controller: true,
  };

  p5.prototype.connectWebsocket = function (url, options = {}) {
    const config = Object.assign({}, defaultOptions, options);
    const fullUrl = url + "?" + serialize(config);

    socket = startWebsocket(fullUrl);

    // this client's connection
    socket.on("onopen", (uid) => {
      if (window.onConnection) {
        onConnection(uid);
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

    socket.on("data", (message, uid) => {
      if (window.messageReceived) {
        messageReceived(message, uid);
      }
    });
  };

  p5.prototype.sendMessage = (message) => {
    if (socket) {
      if (window.WS_DEBUG) console.log("sendin", message);
      socket.emit("send", message);
    }
  };
};
