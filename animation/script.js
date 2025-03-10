console.log("Skrr");

const canvas = document.getElementById("plane");
const ctx = canvas.getContext("2d");

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const pxlZeroX = (WIDTH / 2) + 200;
const pxlZeroY = HEIGHT / 2;
const pxlOneX = 450;
const pxlOneY = 450;
var a = 0;

function ini() {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
}

function drawCord() {
    const col = "yellow";
    const lineWidth = 8;

    // Cord One X
    var x = pxlZeroX - pxlOneX;
    drawLine(x, pxlZeroY - lineWidth, x, pxlZeroY + lineWidth);
    x = pxlZeroX + pxlOneX;
    drawLine(x, pxlZeroY - lineWidth, x, pxlZeroY + lineWidth);

    // Cord One Y
    var y = pxlZeroY - pxlOneY;
    drawLine(pxlZeroX - lineWidth, y, pxlZeroX + lineWidth, y);
    y = pxlZeroY + pxlOneY;
    drawLine(pxlZeroX - lineWidth, y, pxlZeroX + lineWidth, y);

    // Axes
    drawLine(0, pxlZeroY, WIDTH, pxlZeroY);
    drawLine(pxlZeroX, 0, pxlZeroX, HEIGHT);

    function drawLine(x, y, a, b) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(a, b);
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function startThread() {
    const worker = new Worker("worker.js");
    const time = Date.now();
    worker.postMessage({
        angle: a,
        width: WIDTH,
        height: HEIGHT,
        pzx: pxlZeroX,
        pzy: pxlZeroY,
        pox: pxlOneX,
        poy: pxlOneY
    });
    a = a + 0.01;

    worker.onmessage = function(event) {
        const { data } = event.data;

        const img = new ImageData(data, WIDTH, HEIGHT);
        ctx.putImageData(img, 0, 0);
        drawCord();
        const now = Date.now();
        console.log("Frame-Time: " + (now - time) + "ms");
        startThread();
    };
}

ini();
startThread();