// TODO: test script lifecycle
import { initialize } from "../src/initialize";

describe("p5.websocket", () => {
  it("extends the p5 prototype", () => {
    let p5 = jest.fn();

    initialize(p5);

    expect(p5.prototype.connectWebsocket).toBeDefined();
    expect(p5.prototype.sendMessage).toBeDefined();
  });
});
