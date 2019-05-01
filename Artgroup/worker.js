let canvas, ctx;
self.onmessage = e => {
	if (e.data.canvas) {
		canvas = e.data.canvas;
		ctx = canvas.getContext('2d');
		ctx.lineJoin = 'round';
	} else if (e.data == 'clear') {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	} else {
		const {x1, y1, x2, y2, size, color} = e.data;
		draw(x1, y1, x2, y2, size, color);
	}
}

function draw(x1, y1, x2, y2, size, col) {
	ctx.strokeStyle = col;
	ctx.lineWidth = size;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	ctx.stroke();
};