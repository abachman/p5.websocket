import { startWebsocket } from "./socket";

const p5 = window.p5;
let socket = null;

p5.prototype.connectWebsocket = (url) => {
  socket = startWebsocket(url);
  socket.on("data", (message) => {
    if (window.messageReceived) {
      messageReceived(message);
    }
  });
};

p5.prototype.sendMessage = (message) => {
  if (socket) {
    socket.emit("send", message);
  }
};
