const canvas = new OffscreenCanvas(400, 300);
const ctx = canvas.getContext('2d');

let currentId = 0;
ctx.filter = `sepia(.2)`

function getNewContents() {
	return new Promise(res => {
		const result = [];
		for (let i = 0; i < 10; ++i) {
			clear(canvas, ctx);
			const pointNumber = 5 + randInt(5);
			for (let j = 0; j < pointNumber; ++j) {
				drawPoint(canvas, ctx, randomColor(), randomVector(4/3), 25 + randInt(75));
			}
			canvas.convertToBlob().then(blob => {
				const img = document.createElement('img');
				img.width = 400;
				img.height = 300;
				img.classList.add('image' + currentId);
				img.src = URL.createObjectURL(blob);
				if (currentId % 10 === 9) observer.observe(img);

				const label = document.createElement('div');
				label.classList.add('text-center');
				label.textContent = 'Image ' + currentId;

				const imgHolder = document.createElement('div');
				imgHolder.classList.add('stack');
				imgHolder.appendChild(label);
				imgHolder.appendChild(img);
				++currentId;
				result.push(imgHolder);
				if (result.length === 10) res(result);
			});
		}
	});
}

function drawPoint(canvas, ctx, color, position, size = 5) {
    position = position.toWorld(canvas);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(position.x, position.y, size, 0, 2 * Math.PI, true);
    ctx.fill();
};

function randInt(n) {
	return (Math.random() * n) >> 0;
}

function randomColor() {
    return `rgba(${randomShade()}, ${randomShade()}, ${randomShade()}, ${.5 + Math.random() * .5})`
}
function randomShade() {
    return (Math.random() * 256) >> 0
}

function randomVector(wph) {
	return Vector(Math.random() * wph, Math.random());
}

function clear(canvas, ctx) {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function throttle(fn, delay) {
    if (!fn) return fn;
    let start = Date.now() - delay;
    return function (...args) {
        if (Date.now() - start >= delay) {
            fn.apply(this, args);
            start = Date.now();
        }
    }
}
async function wait(s) {
	return new Promise(res => setTimeout(res, s));
}