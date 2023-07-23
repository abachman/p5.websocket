// start a p5.websocket compliant server
import WebSocket from "ws"; // @8.13.0
import Debug from "debug"

const debug = Debug('p5.websocket:server')

export const startServer = () => {
  const port = 18888 + Math.floor(Math.random() * 10000);

  const server = new WebSocket.Server({
    perMessageDeflate: false,
    port: port,
  });

  const connections = [];

  const send = (message) => {
    connections.forEach((conn) => {
      if (conn.readyState === WebSocket.OPEN) {
        conn.send(message);
      }
    });
  };

  server.on("connection", (ws) => {
    connections.push(ws);

    debug("[server] connection opened");
    ws.send(JSON.stringify({ type: "onopen", id: "123" }));

    ws.on("message", (data) => { // data : Buffer
      const dstr = data.toString('utf8');
      debug("[server] message received", dstr);
      send(JSON.stringify({ type: "data", id: "123", data: dstr }));
    });

    ws.on("close", function () {
      debug("[server] connection closed");
      send(JSON.stringify({ type: "disconnect", id: "124" }));
    });
  });

  return { port, server };
};
