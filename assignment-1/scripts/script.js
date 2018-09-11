// Strict mode for error handling
'use strict';

// Useful functions
const select = s => document.querySelector(s);
const show = e => (e.style.display = 'block');
const hide = e => (e.style.display = 'none');

// Element constants
const status = select('.status-message');

const spinner = select('.spinner');

const image1 = select('#image1');
const image2 = select('#image2');

const thumbnail1 = select('#thumb1');
const thumbnail2 = select('#thumb2');

const filename1 = select('#filename1');
const filename2 = select('#filename2');

const fileInput1 = select('#file-input1');
const fileInput2 = select('#file-input2');

const runButton1 = select('#run1');
const runButton2 = select('#run2');

const imgButton1 = select('#select-image1');
const imgButton2 = select('#select-image2');

const selectedImage1 = select('#selected-image1');
const selectedImage2 = select('#selected-image2');

const imageError1 = select('#image-error1');
const imageError2 = select('#image-error2');

// data
const metrics1 = select('#metrics1');
const metrics2 = select('#metrics2');

const dm = select('#dm');
const d4 = select('#d4');
const d8 = select('#d8');
const de = select('#de');

const cc = select('#cc');

// Entry point
document.addEventListener('DOMContentLoaded', () => {
    status.innerHTML = 'Open CV loaded successfully';
    status.classList.remove('status-red');
    status.classList.add('status-green');

    hide(spinner);

    // Setup
    fileInput1.addEventListener('change', e => {
        image1.src = URL.createObjectURL(e.target.files[0]);
        thumbnail1.src = URL.createObjectURL(e.target.files[0]);
        filename1.innerHTML = e.target.files[0].name;
        show(selectedImage1);
        hide(imageError1);
    });

    fileInput2.addEventListener('change', e => {
        image2.src = URL.createObjectURL(e.target.files[0]);
        thumbnail2.src = URL.createObjectURL(e.target.files[0]);
        filename2.innerHTML = e.target.files[0].name;
        show(selectedImage2);
        hide(imageError2);
    });

    imgButton1.onclick = () => {
        fileInput1.click();
    };

    imgButton2.onclick = () => {
        fileInput2.click();
    };

    // Run assignment 1
    runButton1.onclick = () => {
        spinner.style.display = 'block';

        window.setTimeout(() => run1(image1), 10);
    };

    // Run assignment 2
    runButton2.onclick = () => {
        spinner.style.display = 'block';

        // Run processor intensive task
        window.setTimeout(() => run2(image2), 10);
    };
});

// Run assignment 1
const run1 = image => {
    // Read image
    const mat = cv.imread(image);
    const displayMat = cv.imread(image);

    const origin = {
        x: 260,
        y: 415
    };

    const dest = {
        x: 815,
        y: 1000
    };

    let current = origin;

    toGrayScale(mat);
    // toGrayScale(displayMat);

    // Loop may never break
    const maxSteps = 10000;
    let steps = 0;

    while (euclideanDistance(current, dest) !== 0 || steps >= maxSteps) {
        let eightNeightbours = getEightNeighbours(mat, current.x, current.y);

        // calculate euclidean distance for each neighbour
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

        // get first element
        current = candidates[0];

        setPixel(displayMat, current.x, current.y, BLACK);
        steps++;
    }

    // paint origin & destination
    setPixel(displayMat, origin.x, origin.y, CYAN);
    setPixel(displayMat, dest.x, dest.y, CYAN);

    spinner.style.display = 'none';
    steps += 2; // account for origin and destination pixels

    // Fill table with data
    dm.innerHTML = steps;
    d4.innerHTML = d4Distance(origin, dest);
    d8.innerHTML = d8Distance(origin, dest);
    de.innerHTML = euclideanDistance(origin, dest).toFixed(2);
    show(metrics1);

    cv.imshow('canvas', displayMat);
    mat.delete();
    displayMat.delete();
};

// Run assignment 2
const run2 = image => {
    // Read image
    const imgMat = cv.imread(image);
    const displayMat = cv.imread(image);

    // Setup mat, adding 1 column and 1 row
    const offset = 1;
    const mat = new cv.Mat(imgMat.rows + offset, imgMat.cols + offset, imgMat.type());

    for (let i = 0; i < mat.rows; i++) {
        for (let j = 0; j < mat.cols; j++) {
            if (i < offset || j < offset) {
                setPixel(mat, i, j, WHITE);
            } else {
                const pixel = getPixel(imgMat, i - offset, j - offset);
                setPixel(mat, i, j, pixel);
            }
        }
    }

    // 2D array filled with '1'
    const defaultValue = 0;
    const labels = Array(mat.rows)
        .fill(defaultValue)
        .map(() => Array(mat.cols).fill(defaultValue));

    const equivalentLabels = {};
    let currentLabel = 0;

    // Algorithm start
    for (let i = offset; i < mat.rows; i++) {
        for (let j = offset; j < mat.cols; j++) {
            const p = getPixel(mat, i, j);

            if (isBlack(p)) {
                const t = getPixel(mat, i - 1, j);
                const r = getPixel(mat, i, j - 1);

                if (!isBlack(t) && !isBlack(r)) {
                    labels[i][j] = ++currentLabel;
                } else if (isBlack(t) && !isBlack(r)) {
                    labels[i][j] = labels[t.x][t.y];
                } else if (!isBlack(t) && isBlack(r)) {
                    labels[i][j] = labels[r.x][r.y];
                } else {
                    // both are black, check if labels match
                    const labelT = labels[t.x][t.y];
                    const labelR = labels[r.x][r.y];

                    if (labelT != labelR) {
                        // they should have the same label!

                        if (labelT == 0 || labelR == 0) {
                            // Maybe one of them doesn't have a label
                            let selectedLabel;
                            if (labelT == 0) {
                                selectedLabel = labelR;
                            } else {
                                selectedLabel = labelT;
                            }

                            labels[i][j] = selectedLabel;
                            labels[i - 1][j] = selectedLabel;
                            labels[i][j - 1] = selectedLabel;
                        } else {
                            // check if equivalency does not already exists
                            if (
                                (equivalentLabels[labelT] && equivalentLabels[labelT] != labelR) ||
                                (equivalentLabels[labelR] && equivalentLabels[labelR]) != labelT
                            ) {
                                equivalentLabels[labelT] = labelR;
                            }
                        }
                    } else {
                        labels[i][j] = labelT;
                    }
                }
            }
        }
    }

    // Fix equivalent labels
    for (let i = 0; i < mat.rows; i++) {
        for (let j = 0; j < mat.cols; j++) {
            Object.keys(equivalentLabels).forEach(key => {
                let label = labels[i][j];
                if (label == key) labels[i][j] = equivalentLabels[key];
            });
        }
    }

    // Remove duplicates
    const allLabels = [];

    for (let i = 0; i < mat.rows; i++) {
        for (let j = 0; j < mat.cols; j++) {
            if (!allLabels.includes(labels[i][j])) {
                allLabels.push(labels[i][j]);
            }
        }
    }

    // Orders labels
    for (let i = 0; i < mat.rows; i++) {
        for (let j = 0; j < mat.cols; j++) {
            for (let l = 0; l < allLabels.length; l++) {
                if (labels[i][j] == allLabels[l]) {
                    labels[i][j] = l;
                }
            }
        }
    }

    // Orders labels
    for (let l = 0; l < allLabels.length; l++) {
        allLabels[l] = l;
    }

    // Show some pretty colors to tell labels appart
    for (let i = 0; i < mat.rows; i++) {
        for (let j = 0; j < mat.cols; j++) {
            setPixel(mat, i, j, {
                r: 255 - ((255 * 1) / 3) * (allLabels.indexOf(labels[i][j]) + 1),
                g: 255 - ((255 * 1) / 2) * (allLabels.indexOf(labels[i][j]) + 1),
                b: 255 - ((255 * 2) / 3) * (allLabels.indexOf(labels[i][j]) + 1),
                a: 255
            });
        }
    }

    console.log(allLabels);

    cc.innerHTML = allLabels.length;
    show(metrics2);

    spinner.style.display = 'none';

    cv.imshow('canvas', mat);
    mat.delete();
    imgMat.delete();
    displayMat.delete();
};
