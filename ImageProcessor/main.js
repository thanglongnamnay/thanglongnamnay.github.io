const exp1 = e => a => a ** e; // [0, 1]
const log1 = a => Math.log(a + 1) / Math.log(2);
const sizeX = 300;
const sizeY = 300;

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);
ctx.drawImage(document.getElementById('result-img'), 0, 0, 500, 500);

const attrInputs = document.getElementsByClassName('attr-input');

let data = [...ctx.getImageData(0, 0, sizeX, sizeY).data];

const doTheShit = e => {
	let imgData = new ImageData(sizeX, sizeY)
	imgData.data.set(data.map(x => x / 256).map(exp1(e)).map(x => x * 256 >> 0), 0);
	ctx.putImageData(imgData, 0, 0);
}

attrInputs[0].onchange = e => doTheShit(e.target.value - 0);