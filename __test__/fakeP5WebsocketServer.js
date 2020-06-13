// start a fake, p5.websocket compliant server
import WebSocket from "ws";

export const startServer = () => {
  const port = 18888 + Math.floor(Math.random() * 10000);

  const server = new WebSocket.Server({
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

    // console.log("[server] connection opened");
    ws.send(JSON.stringify({ type: "onopen", id: "123" }));

    ws.on("message", (data) => {
      send(JSON.stringify({ type: "data", id: "123", data: data }));
    });

    ws.on("close", function () {
      // console.log("[server] connection closed");
      send(JSON.stringify({ type: "disconnect", id: "124" }));
      // connections.forEach((conn) => {
      //   try {
      //     conn.send(JSON.stringify({ type: "disconnect", id: "124" }));
      //   } catch (ex) {
      //     console.log("got error in send", ex);
      //   }
      // });
    });
  });

  return { port, server };
};
