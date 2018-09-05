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
const distance = select('.dm-distance');

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
    const maxTries = 10000;
    let tries = 0;

    while (euclideanDistance(current, dest) !== 0 || tries >= maxTries) {
        let eightNeightbours = getEightNeighbours(mat, current.x, current.y);

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

// Run assignment 2
const run2 = image => {
    const mat = cv.imread(image);
    const displayMat = cv.imread(image);

    const labels = [];
    let currentLabel = 0;

    const rows = mat.rows;
    const cols = mat.cols;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const pixel = getPixel(mat, i, j);

            if (isBlack(pixel)) {
                let chosenLabel;
                const eightNeighbours = getEightNeighbours(mat, i, j);
                eightNeighbours.forEach(p => {
                    for (let l of labels) {
                        if (l.x === p.x && l.y === p.y) {
                            chosenLabel = l.label;
                            break;
                        }
                    }
                });

                console.log(i, j, chosenLabel);

                // If there is a chosenLabel, pixel is near labeled black pixel
                if (chosenLabel) {
                    labels.push({
                        x: i,
                        y: j,
                        label: chosenLabel
                    });
                } else {
                    labels.push({
                        x: i,
                        y: j,
                        label: currentLabel++
                    });
                }
            }
        }
    }

    console.log(labels.map(x => x.label));

    spinner.style.display = 'none';

    cv.imshow('canvas', mat);
    mat.delete();
    displayMat.delete();
};
