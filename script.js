'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const select = s => document.querySelector(s);
    const show = e => (e.style.display = 'block');
    const hide = e => (e.style.display = 'none');

    const status = select('.status-message');
    const image = select('.image');
    const thumbnail = select('.thumb-image');
    const distance = select('.dm-distance');
    const imageFilename = select('.image-filename');
    const fileInput = select('.file-input');
    const runButton = select('#run');
    const imgButton = select('#select-image');
    const spinner = select('.spinner');

    status.innerHTML = 'Open CV loaded successfully';
    status.classList.remove('status-red');
    status.classList.add('status-green');
    hide(spinner);

    fileInput.addEventListener('change', e => {
        image.src = URL.createObjectURL(e.target.files[0]);
        thumbnail.src = URL.createObjectURL(e.target.files[0]);
        imageFilename.innerHTML = e.target.files[0].name;
    });

    image.onload = () => {
        console.log('Image loaded.');
    };

    imgButton.onclick = () => {
        fileInput.click();
    };

    runButton.onclick = () => {
        spinner.style.display = 'block';

        window.setTimeout(run, 10);
    };

    const run = () => {
        let mat = cv.imread(image);
        let displayMat = cv.imread(image);

        cv.imshow('canvas', displayMat);

        const origin = {
            x: 260,
            y: 415
        };

        const dest = {
            x: 815,
            y: 1000
        };

        let current = origin;
        let bestDistance = euclideanDistance(current, dest);

        toGrayScale(mat);
        // toGrayScale(displayMat);

        let tries = 0;
        let maxTries = 10000;

        //or while current != dest
        while (euclideanDistance(current, dest) !== 0 || tries >= maxTries) {
            let eightNeightbours = getEightNeightbours(mat, current.x, current.y);

            eightNeightbours = eightNeightbours.map(e => ({
                ...e,
                distance: euclideanDistance(e, dest)
            }));

            //sort by distance
            eightNeightbours.sort((a, b) => a.distance - b.distance);

            //3 closest pixels
            const candidates = eightNeightbours.slice(0, 3);

            //sort by gray level
            candidates.sort((a, b) => a.r - b.r);

            current = candidates[0];
            bestDistance = current.distance;

            setPixel(displayMat, current.x, current.y, BLACK);
            tries++;
        }

        setPixel(displayMat, origin.x, origin.y, CYAN);
        setPixel(displayMat, dest.x, dest.y, CYAN);

        spinner.style.display = 'none';
        distance.innerHTML = `Dm distance: ${tries}`;

        cv.imshow('canvas', displayMat);
        mat.delete();
        displayMat.delete();
    };
});

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

const getEightNeightbours = (mat, x, y) => [
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
