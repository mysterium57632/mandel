/**
 * With this approach i just wanted to draw the mandelbrotset as foundation for futer projects.
 */

console.log("Start");

const canvas = document.getElementById("plane");
const ctx = canvas.getContext("2d");

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const pxlZeroX = (WIDTH / 2) + 200;
const pxlZeroY = HEIGHT / 2;
const pxlOneX = 450;
const pxlOneY = 450;
const iterations = 1000;

var START_RE;
var START_IM;

/**
 * A Class for better handling of complex Numbers 
 */
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


/**
 * Draws the coordinate system
 */
function drawCord() {
    const col = "yellow";
    const lineWidth = 8;

    // Coord One X
    var x = pxlZeroX - pxlOneX;
    drawLine(x, pxlZeroY - lineWidth, x, pxlZeroY + lineWidth);
    x = pxlZeroX + pxlOneX;
    drawLine(x, pxlZeroY - lineWidth, x, pxlZeroY + lineWidth);

    // Coord One Y
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

/**
 * Calculats the complex value in respect to the origin and one
 * @param {*} x Pixel coord
 * @param {*} y Pixel coord
 * @returns Array([RE, IM]) with the value of the number 
 */
function pixelToNumber(x, y) {
    return [
        -1 * calcPoint(pxlZeroX, x, pxlOneX),
        calcPoint(pxlZeroY, y, pxlOneY)
    ];

    function calcPoint(pxlZero, z, pxlOne) {
        return (pxlZero - z) / pxlOne;
    }
}

/**
 * Calculates for each pixel the corresponding color
 */
function calcMandelbrot() {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = image.data;

    for (i = 0; i < WIDTH; i++) {
        for (j = 0; j < HEIGHT; j++) {
            writeToImage(i, j, calcMandel(i, j));
        }
    }

    ctx.putImageData(image, 0, 0);

    /**
     * calculates the complexe value in respext to the pixel-coords and the iterations
     * @param {*} x Pixel coord
     * @param {*} y Pixel coord
     * @returns number of iterations
     */
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

    /**
     * Gives each Pixel the corisponding color
     * @param {*} x Pixel coord
     * @param {*} y Pixel coord
     * @param {*} iter How many iterations it took until the complex number reached the Threshhold.
     */
    function writeToImage(x, y, iter) {
        const i = (y * WIDTH * 2 + x) * 4;
        const per = iter / iterations;

        // If the Complex Number did not converges to infinity
        if (per == 1.0) {
            dataBig[i] = 0;
            dataBig[i + 1] = 0;
            dataBig[i + 2] = 0;
            dataBig[i + 3] = 255;
            return;
        }

        // Value of the Pixel
        const val = calcCol(per) * 255;

        dataBig[i] = val;
        dataBig[i + 1] = val;
        dataBig[i + 2] = 50 + per * 205; // For a blue Background
        dataBig[i + 3] = 255;

        function calcCol(per) {
            // to increase the brightness
            return Math.pow(per, 0.75);
        }
    }
}


ini();
const startTime = Date.now();
calcMandelbrot();
console.log("compute-duration: " + (Date.now() - startTime) + "ms");
drawCord();
