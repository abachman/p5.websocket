let x = 0;
let myColor;
let connected = false;

function setup() {
  createCanvas(500, 500);
  background(0);

  // connect to an instance of github.com/abachman/p5-websocket-server locally
  connectWebsocket("ws://localhost:4004/p5.websocket-dev");

  noStroke();
  fill(255);
  myColor = color(random(255), 128, random(255));
}

function draw() {}

function onConnection() {
  console.log("i am connected!");
  fill(0, 200, 0);
  rect(0, 0, 10, 10);
}

function onDisconnection() {
  console.log("i am disconnected :(");
  fill(200, 0, 0);
  rect(0, 0, 10, 10);
}

function connectReceived(otherId) {
  console.log("another sketch connected", otherId);
}

function disconnectReceived(otherId) {
  console.log("another sketch disconnected", otherId);
}

function messageReceived(data) {
  if (typeof data === "object") {
    let localColor = data.color || color(100);
    fill(localColor);
    ellipse(data.x, data.y, 30);
  }
}

function mousePressed() {
  sendMessage("hi!");
  sendMessage({
    x: mouseX,
    y: mouseY,
    color: myColor.toString(),
  });
}
