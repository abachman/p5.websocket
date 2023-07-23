// TODO: test socket lifecycle

import { startWebsocket } from "../src/socket";
import { startServer } from "./support/p5-websocket-server";

describe("startWebsocket client", () => {
  let wsServer;
  let port;
  let client;

  // start the test server and leave it running through the whole suite
  beforeAll(() => {
    const server = startServer();
    wsServer = server.server;
    port = server.port;
  });

  afterAll((done) => {
    wsServer.close(done);
  });

  afterEach(() => {
    // clean up after clients to avoid test cross-contamination
    if (client) {
      client.emit("close");
    }
  });

  it("returns a websocket event emitter", () => {
    client = startWebsocket(`ws://localhost:${port}`);
    expect(client).toBeDefined();
    expect(client.on).toBeDefined();
    expect(client.emit).toBeDefined();
  });

  it("emits onopen event when connecting", (done) => {
    client = startWebsocket(`ws://localhost:${port}`);

    client.on("onopen", (id) => {
      expect(id).toBeDefined();
      expect(id).toEqual("123");
      done();
    });
  });

  it("emits data event when plain string data is sent", (done) => {
    client = startWebsocket(`ws://localhost:${port}`);

    client.on("onopen", (id) => {
      expect(id).toBeDefined();
      expect(id).toEqual("123");

      client.emit("send", "hello world");
    });

    client.on("data", (data, id) => {
      expect(id).toBeDefined();
      expect(id).toEqual("123");
      expect(data).toBe("hello world");
      done();
    });
  });

  it("emits data event when JSON.stringify data is sent", (done) => {
    client = startWebsocket(`ws://localhost:${port}`);

    client.on("onopen", (id) => {
      expect(id).toBeDefined();
      expect(id).toEqual("123");
      client.emit("send", JSON.stringify({ hello: "world" }));
    });

    client.on("data", (data, id) => {
      expect(id).toBeDefined();
      expect(id).toEqual("123");
      expect(data).toStrictEqual({ hello: "world" });
      done();
    });
  });

  describe("other clients", () => {
    let otherClient;

    beforeEach(() => {
      otherClient = startWebsocket(`ws://localhost:${port}`);
    });

    afterEach(() => {
      otherClient.emit("close");
    });

    it("emits disconnect event when another client disconnects", (done) => {
      client = startWebsocket(`ws://localhost:${port}`);

      client.on("onopen", (_evt) => {
        otherClient.emit("close");
      });

      client.on("disconnect", (id) => {
        expect(id).toBeDefined();
        expect(id).toEqual("124");
        done();
      });
    });

    it("receives messages from other clients", (done) => {
      client = startWebsocket(`ws://localhost:${port}`);

      client.on("onopen", (_evt) => {
        otherClient.emit("send", JSON.stringify({ type: "data", data: "abc" }));
      });

      client.on("data", (data, id) => {
        expect(data).toBeDefined();
        expect(data).toEqual({ type: "data", data: "abc" });
        expect(id).toBeDefined();
        expect(id).toEqual("123");

        done();
      });
    });
  });
});
