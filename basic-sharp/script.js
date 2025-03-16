/**
 * This was build on the basic mandelbrot image.
 * 
 * The idea of this approach was to get a increased amount of pixels
 * (in this particular case four times the screen) and calculate for each value of the array
 * the correspondig color value. Then groups of pixels were avraged to one single pixel.
 * 
 * I hoped that the resulted image would have a lot more detail,
 * but as it turns out, this was not the case.
 * To make this approach faster, it should be possible to calculate the avrage of the
 * number of iterations and then calcualte the color for the already avraged iteration count.
 * It should also be possible to do this in only a single iteration of the larger array.
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
        -1 * calcPoint(pxlZeroX*2, x, pxlOneX*2),
        calcPoint(pxlZeroY*2, y, pxlOneY*2)
    ];

    function calcPoint(pxlZero, z, pxlOne) {
        return (pxlZero - z) / pxlOne;
    }
}

function calcMandelbrot() {
    // create a array with 4 times the pixels of the screen
    const dataBig = new Uint8ClampedArray(WIDTH * HEIGHT * 16);

    // iterate over each pixel of a canvas with double length and double height
    for (let i = 0; i < WIDTH*2; i++) {
        for (let j = 0; j < HEIGHT*2; j++) {
            writeToImage(i, j, calcMandel(i, j));
        }
    }

    // Array for each pixel
    const data = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
    for (let i = 0; i < WIDTH; i++) {
        for (let j = 0; j < HEIGHT; j++) {
            const index = (j * WIDTH + i) * 4;
            // h is for each of the RGBA components of the Color
            for (let h = 0; h < 4; h++) {
                data[index + h] = avr(i, j, h);
            }

            function avr(i, j, x) {
                let col = 0;
                // calculate the index of four pixels and avrage them to only one value
                i = i*2;
                j = j*2;
                const cords = [[i, j], [i+1,j], [i, j+1], [i+1,j+1]];
                for (let y = 0; y < 4; y++) {
                    let [a,b] = cords[y];
                    const index = (b * WIDTH * 2 + a) * 4;
                    col = col + dataBig[index + x];
                }
                return Math.floor(col / 4);
            }
        }
    }

    // Create and draw Image to canvas
    const img = new ImageData(data, WIDTH, HEIGHT);
    ctx.putImageData(img, 0, 0);

    /**
     * Calculats the number of iterations until the Complex Number exceeds the Threshhold
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
const startTime = Date.now(); // Measure the calculation-duration
calcMandelbrot();
console.log("compute-duration: " + (Date.now() - startTime) + "ms");
drawCord();