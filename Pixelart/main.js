'use strict';
const holder = document.getElementById('image-holder');
const chunkSizeInput = document.getElementById('chunkSize');
const fileInput = document.getElementById('uploadInput');
fileInput.onchange = updateSize;
document.getElementById('createPixelArtButton').onclick = handleMakeArtButton;
const worker = new Worker('worker.js');
const CHUNK_SIZE = 5;
const makeFill = (chunkWidth, divList) => (x, y, mean) => {
    divList[y * chunkWidth + x].style.background 
        = `rgba(${mean[0]}, ${mean[1]}, ${mean[2]}, ${mean[3]})`;
};
function createDivs(width, height) {
    holder.innerHTML = '';
    holder.style.gridTemplateColumns = '10px '.repeat(width);
    holder.style.gridTemplateRows = '10px '.repeat(height);
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const div = document.createElement('div');
            holder.appendChild(div);
        }
    }
    return holder.getElementsByTagName('div');
}
function pixelArt(image, chunkSize) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const chunkWidth = image.width >> chunkSize,
        chunkHeight = image.height >> chunkSize;
    const divList = createDivs(chunkWidth, chunkHeight);
    const fill = makeFill(chunkWidth, divList);
    worker.onmessage = e => {
        const { x, y, mean } = e.data;
        fill(x, y, mean);
    };
    for (let y = 0; y < chunkHeight; ++y) {
        for (let x = 0; x < chunkWidth; ++x) {
            const data = ctx.getImageData(
                x << chunkSize,
                y << chunkSize,
                1 << chunkSize,
                1 << chunkSize
            );
            worker.postMessage({ x, y, data: data.data });
        }
    }
}
function printFile(file, chunkSize) {
    // const canvas = document.getElementById('canvas');
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = e => {
        pixelArt(image, chunkSize);
    };
}

function updateSize(e) {
    let nBytes = e.target.files[0].size;
    let sOutput = nBytes + ' bytes';
    // optional code for multiples approximation
    for (
        let aMultiples = ['KB','MB','GB','TB','PB','EB','ZB','YB'],
            nMultiple = 0,
            nApprox = nBytes / 1024;
        nApprox > 1;
        nApprox /= 1024, nMultiple++
    ) {
        sOutput =
            nApprox.toFixed(3) +
            ' ' +
            aMultiples[nMultiple] +
            ' (' +
            nBytes +
            ' bytes)';
    }
    // end of optional code
    document.getElementById('fileNum').innerHTML = 1;
    document.getElementById('fileSize').innerHTML = sOutput;
}

function handleMakeArtButton(e) {
    printFile(fileInput.files[0], chunkSizeInput.value);
}