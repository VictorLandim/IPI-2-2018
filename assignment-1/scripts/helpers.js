// Pixel constants
const RED = {
    r: 255,
    g: 0,
    b: 0,
    a: 255
};

const CYAN = {
    r: 0,
    g: 255,
    b: 255,
    a: 255
};

const BLACK = {
    r: 0,
    g: 0,
    b: 0,
    a: 255
};

// Helper functions for image manipulation
const getPixel = (mat, x, y) => ({
    x,
    y,
    r: mat.data[x * mat.cols * mat.channels() + y * mat.channels()],
    g: mat.data[x * mat.cols * mat.channels() + y * mat.channels() + 1],
    b: mat.data[x * mat.cols * mat.channels() + y * mat.channels() + 2],
    a: mat.data[x * mat.cols * mat.channels() + y * mat.channels() + 3]
});

const setPixel = (mat, x, y, { r, g, b, a }) => {
    mat.data[x * mat.cols * mat.channels() + y * mat.channels()] = r;
    mat.data[x * mat.cols * mat.channels() + y * mat.channels() + 1] = g;
    mat.data[x * mat.cols * mat.channels() + y * mat.channels() + 2] = b;
    mat.data[x * mat.cols * mat.channels() + y * mat.channels() + 3] = a;
};

const toGrayScale = mat => {
    const rows = mat.rows;
    const cols = mat.cols;

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            let pixel = getPixel(mat, i, j);
            const y = pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114;
            pixel.r = pixel.g = pixel.b = y;

            setPixel(mat, i, j, pixel);
        }
    }
};

const getEightNeighbours = (mat, x, y) => [
    getPixel(mat, x - 1, y - 1),
    getPixel(mat, x, y - 1),
    getPixel(mat, x + 1, y - 1),
    getPixel(mat, x - 1, y),
    getPixel(mat, x + 1, y),
    getPixel(mat, x - 1, y + 1),
    getPixel(mat, x, y + 1),
    getPixel(mat, x + 1, y + 1)
];

const euclideanDistance = (a, b) => Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));

const isBlack = ({ r, g, b, a }) => r === 0 && g === 0 && b === 0;
