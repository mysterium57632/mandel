console.log("Skrr");

const canvas = document.getElementById("plane");
const ctx = canvas.getContext("2d");

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const pxlZeroX = (WIDTH / 2);
const pxlZeroY = HEIGHT / 2;
const pxlOneX = 450;
const pxlOneY = 450;

const ampl = 2;

var START_RE;
var START_IM;

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

    START_RE = 0;
    START_IM = 0;
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
        -1 * calcPoint(pxlZeroX*ampl, x, pxlOneX*ampl),
        calcPoint(pxlZeroY*ampl, y, pxlOneY*ampl)
    ];

    function calcPoint(pxlZero, z, pxlOne) {
        return (pxlZero - z) / pxlOne;
    }
}

function calcMandelbrot() {
    const dataBig = new Uint8ClampedArray(WIDTH * HEIGHT * 4 * ampl * ampl);
    const iterations = 100;

    for (let i = 0; i < WIDTH*ampl; i++) {
        for (let j = 0; j < HEIGHT*ampl; j++) {
            writeToImage(i, j, calcMandel(i, j));
        }
    }

    const data = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
    for (let i = 0; i < WIDTH; i++) {
        for (let j = 0; j < HEIGHT; j++) {
            const index = (j * WIDTH + i) * 4;
            for (let h = 0; h < 4; h++) {
                data[index + h] = avr(i, j, h);
            }

            function avr(i, j, x) {
                let col = 0;
                i = i*2;
                j = j*2;
                const cords = [[i, j], [i+1,j], [i, j+1], [i+1,j+1]];
                for (let y = 0; y < 4; y++) {
                    let [a,b] = cords[y];
                    const index = (b * WIDTH + a) * 4;
                    col = col + dataBig[index + x];
                }
                return Math.floor(col / 4);
            }
        }
    }

    const img = new ImageData(data, WIDTH, HEIGHT);
    ctx.putImageData(img, 0, 0);

    function calcMandel(x, y) {
        const cords = pixelToNumber(x, y);
        const z = new Complex(START_RE, START_IM);
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
        const i = (y * WIDTH + x) * 4;
        const per = iter / iterations;

        if (per == 1.0) {
            dataBig[i] = 0;
            dataBig[i + 1] = 0;
            dataBig[i + 2] = 0;
            dataBig[i + 3] = 255;
            return;
        }

        const val = calcCol(per) * 255;

        dataBig[i] = val;
        dataBig[i + 1] = val;
        dataBig[i + 2] = 50 + per * 205;
        dataBig[i + 3] = 255;
    }

    function calcCol(per) {
        // return -1*(per*per) + 2 * per;
        return Math.pow(per, 0.75);
    }
}


ini();
const startTime = Date.now();
calcMandelbrot();
console.log("compute-duration: " + (Date.now() - startTime) + "ms");
drawCord();