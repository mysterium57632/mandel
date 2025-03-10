const iterations = 500;

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

self.onmessage = function(event) {
    const { angle, width, height, pzx, pzy, pox, poy } = event.data;

    const test = Math.sin(angle)
    const START_RE = test;
    const START_IM = test;
    const pxlZeroX = pzx;
    const pxlZeroY = pzy;
    const pxlOneX = pox;
    const pxlOneY = poy;

    const data = new Uint8ClampedArray(width * height * 4);

    function calcMandelbrot() {
        for (i = 0; i < width; i++) {
            for (j = 0; j < height; j++) {
                writeToImage(i, j, calcMandel(i, j));
            }
        }
    
        function calcMandel(x, y) {
            // Change the starting Values here
            const z = new Complex(START_RE * 2, 0);
            const cords = pixelToNumber(x, y);
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
            const i = (y * width + x) * 4;
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

    function pixelToNumber(x, y) {
        return [
            -1 * calcPoint(pxlZeroX, x, pxlOneX),
            calcPoint(pxlZeroY, y, pxlOneY)
        ];
    
        function calcPoint(pxlZero, z, pxlOne) {
            return (pxlZero - z) / pxlOne;
        }
    }

    calcMandelbrot();

    // Send back the computed image data to the main thread
    postMessage({ data });
};