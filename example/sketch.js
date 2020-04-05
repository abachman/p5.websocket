let x = 0;
let myColor;

console.log("SKEEEETCH");

function setup() {
  createCanvas(500, 500);
  background(0);
  connectWebsocket("wss://p5-websocket.glitch.me/streaming");
  noStroke();
  fill(255);
  myColor = color(random(255), 128, random(255));
}

function draw() {}

function messageReceived(data) {
  let localColor = data.color || color(100);
  fill(localColor);
  ellipse(data.x, data.y, 30);
}

function mousePressed() {
  sendMessage({
    x: mouseX,
    y: mouseY,
    color: myColor.toString(),
  });
}
