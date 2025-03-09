console.log("Skrr");

const canvas = document.getElementById("plane");
const ctx = canvas.getContext("2d");

const WIDTH = 1850;
const HEIGHT = 900;
const pxlZeroX = WIDTH / 2;
const pxlZeroY = HEIGHT / 2;
const pxlOneX = 200;
const pxlOneY = 200;


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

function pixelToNumber(x, y) {
    return [
        -1 * calcPoint(pxlZeroX, x, pxlOneX),
        calcPoint(pxlZeroY, y, pxlOneY)
    ];

    function calcPoint(pxlZero, z, pxlOne) {
        var dist = (pxlZero - z);
        return dist / pxlOne;
    }
}

ini();
drawCord();




console.log(pixelToNumber(400, 300));