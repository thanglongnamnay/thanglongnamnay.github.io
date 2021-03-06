'use strict';

(function() {
	const $ = id => document.getElementById(id);
	const socket = io('https://longcppblog.herokuapp.com/artgroup');
	const canvas = $('canvas');
	const scale = 2;
	canvas.width = 720 * scale;
	canvas.height = 480 * scale;
	const penSizeLabel = $('penSizeLabel');
	const penSizeInput = $('penSize');
	const penColorInput = $('penColor');
	const btnClear = $('btnClear');
	const pVoteClear = $('pVoteClear');
	const btnAgree = $('btnAgree');
	const btnDisagree = $('btnDisagree');
	const btnDownload = $('btnDownload');
	const population = $('population');
	penSizeInput.min = scale;
	penSizeInput.max = scale * 12;
	penSizeInput.step = scale;
	penSizeInput.value = scale * 4;
	let drawing = false, x, y, penSize = penSizeInput.value, color = penColorInput.value;
	penSizeInput.onchange = e => {
		penSize = e.target.value;
		penSizeLabel.innerText = `Pen's size ${e.target.value} `;
	};
	penColorInput.onchange = e => {
		color = e.target.value;
	};
	btnDownload.onclick = e => {
		const imgUrl = canvas.toDataURL('image/png');
		e.target.href = imgUrl;
	}

	let worker, offscreen, ctx, draw;
	if (canvas.transferControlToOffscreen) {
		worker = new Worker('worker.js');
		offscreen = canvas.transferControlToOffscreen();
		worker.postMessage({canvas: offscreen}, [offscreen]);
		draw = (x1, y1, x2, y2, size, color, isEmit = true) => {
			worker.postMessage({x1, y1, x2, y2, size, color});
			if (isEmit) socket.emit('draw', {x1, y1, x2, y2, size, color});
		}
	} else {
		ctx = canvas.getContext('2d');
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		draw = (x1, y1, x2, y2, size, color, isEmit = true) => {
			ctx.strokeStyle = color;
			ctx.lineWidth = size;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.closePath();
			ctx.stroke();
			if (isEmit) socket.emit('draw', {x1, y1, x2, y2, size, color});
			// console.log('draw');
		};
	}

	canvas.addEventListener('mousedown', handleMouseDown);
	canvas.addEventListener('mouseup', handleMouseUp);
	canvas.addEventListener('mouseleave', handleMouseLeave);
	canvas.addEventListener('mouseenter', handleMouseEnter);
	canvas.addEventListener('mousemove', handleMouseMove);

	canvas.addEventListener('touchstart', handleMouseDown);
	canvas.addEventListener('touchend', handleTouchEnd);
	canvas.addEventListener('touchcancel', handleTouchEnd);
	canvas.addEventListener('touchmove', handleMouseMove);
	function hideVoteBtns(hide) {
		btnAgree.hidden = hide;
		btnDisagree.hidden = hide;
	}
	btnClear.onclick = () => {
		socket.emit('clear');
		pVoteClear.innerText = `Agree: 1. Disagree: 0`;
		hideVoteBtns(false);
	};
	btnAgree.onclick = () => {
		socket.emit('vote clear', true);
	}
	btnDisagree.onclick = () => {
		socket.emit('vote clear', false);
	}
	socket.on('welcum', pop => population.innerText = `${pop} people in room. `);
	socket.on('draw', line => {
		const {x1, y1, x2, y2, size, color} = line;
		draw(x1, y1, x2, y2, size, color, false);
	});
	socket.on('vote clear', () => {
		pVoteClear.innerText = `Agree: 1. Disagree: 0`;
		hideVoteBtns(false);
	});
	socket.on('someone voted', data => {
		pVoteClear.innerText = `Agree: ${data.agree}. Disagree: ${data.disagree}`;
	})
	socket.on('clear', () => {
		if (worker) worker.postMessage('clear');
		else ctx.clearRect(0, 0, canvas.width, canvas.height);
		pVoteClear.innerText = '';
		hideVoteBtns(true);
		socket.emit('cleared');
	});
	socket.on('not clear', () => {
		pVoteClear.innerText = '';
		hideVoteBtns(true);
		socket.emit('cleared');
	});
	function handleMouseMove(e) {
		e.preventDefault();
		const xy = getXY(e);
		if (drawing) draw(x, y, xy.x, xy.y, penSize, color);
		setxy(xy);
	}
	function handleMouseEnter(e) {
		e.preventDefault();
		const xy = getXY(e);
		setxy(xy);
	}
	function handleMouseLeave(e) {
		e.preventDefault();
		const xy = getXY(e);
		if (drawing) draw(x, y, xy.x, xy.y, penSize, color);
		drawing = false;
	}
	function handleMouseDown(e) {
		e.preventDefault();
		const xy = getXY(e);
		setxy(xy);
		drawing = true;
	};
	function handleMouseUp(e) {
		e.preventDefault();
		const xy = getXY(e);
		setxy(xy);
		drawing = false;
	}
	function handleTouchEnd(e) {
		e.preventDefault();
		drawing = false;
	}
	function getXY(e) {
		return {
			x: (e.offsetX || (e.touches[0].clientX - e.target.offsetLeft)) * scale,
			y: (e.offsetY || (e.touches[0].clientY - e.target.offsetTop)) * scale
		}
	}
	function setxy(xy) { x = xy.x; y = xy.y}
})();