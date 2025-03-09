console.log("Skrr");

const canvas = document.getElementById("plane");
const ctx = canvas.getContext("2d");

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const pxlZeroX = (WIDTH / 2) + 200;
const pxlZeroY = HEIGHT / 2;
const pxlOneX = 450;
const pxlOneY = 450;

class Complex {

    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    square() {
        const old = this.re;
        this.re = this.re * this.re - this.im * this.im;
        this.im = old * this.im + this.im * old;
    }

    add(other) {
        this.re = this.re + other.re;
        this.im = this.im + other.im;
    }

    absSquared() {
        return this.re * this.re + this.im * this.im;
    }
}

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
        return (pxlZero - z) / pxlOne;
    }
}

function calcMandelbrot() {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = image.data;
    const iterations = 500;

    for (i = 0; i < WIDTH; i++) {
        for (j = 0; j < HEIGHT; j++) {
            writeToImage(i, j, calcMandel(i, j));
        }
    }

    ctx.putImageData(image, 0, 0);

    function calcMandel(x, y) {
        const cords = pixelToNumber(x, y);
        const z = new Complex(0, 0);
        const c = new Complex(cords[0], cords[1]);
        for (let i = 0; i < iterations; i++) {
            z.square();
            z.add(c);
            if (z.absSquared() > 4)
                return i;
        }
        return iterations;
    }

    function writeToImage(x, y, iter) {
        const i = (y * canvas.width + x) * 4;
        const per = iter / iterations;

        if (per == 1.0) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
            return;
        }

        const val = calcCol(per) * 255;

        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = 50 + per * 205;
        data[i + 3] = 255;
    }

    function calcCol(per) {
        // return -1*(per*per) + 2 * per;
        return Math.pow(per, 0.75);
    }
}

ini();
const first = Date.now();
calcMandelbrot();
console.log(Date.now() - first);
drawCord();