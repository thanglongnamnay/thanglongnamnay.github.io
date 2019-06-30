const observer = new IntersectionObserver(handleNewContentObserve, { threshold: .5 });
const canvas = new OffscreenCanvas(400, 300);
const ctx = canvas.getContext('2d');
const imagesHolder = document.getElementById('images');
const loadingEl = document.getElementById('loading');

let prevY = 0;
let currentId = 0;

handleNewContentObserve();

function handleNewContentObserve(entries) {
	if (entries) {
		if (!entries[0].isIntersecting) return;
		observer.unobserve(entries[0].target);
		const currY = entries[0].boundingClientRect.y;
		console.log(prevY, currY);
		if (currY <= prevY) {
			prevY = currY; 
			return;
		}
	}
	console.log('Loading new images');
	// setTimeout(appendContent, 1000);
	appendContent();
};

function appendContent() {
	for (let i = 0; i < 10; ++i) {
		clear(canvas, ctx);
		const pointNumber = 5 + randInt(5);
		for (let j = 0; j < pointNumber; ++j) {
			drawPoint(canvas, ctx, randomColor(), randomVector(4/3), 25 + randInt(75));
		}
		canvas.convertToBlob().then(blob => {
			const img = document.createElement('img');
			img.width = 400;
			img.height = 150 + randInt(300);
			img.classList.add('image' + currentId);
			img.src = URL.createObjectURL(blob);
			if (currentId % 10 === 9) observer.observe(img);
			const label = document.createElement('span');
			label.textContent = 'Image ' + currentId;
			++currentId;
			imagesHolder.appendChild(label);
			imagesHolder.appendChild(img);
		});
	}
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
    return '#' + randomShade() + randomShade() + randomShade();
}
function randomShade() {
    let s = (Math.random() * 256 >> 0).toString(16);
    if (s.length < 2) s = '0' + s;
    return s;
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