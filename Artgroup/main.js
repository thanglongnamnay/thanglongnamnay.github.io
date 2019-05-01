'use strict';

(function() {
	const $ = id => document.getElementById(id);
	const socket = io('https://thanglongnamnay.me/artgroup');
	const canvas = $('canvas');
	const scale = 2;
	canvas.width = 720 * scale;
	canvas.height = 480 * scale;
	let worker = new Worker('worker.js');
	const offscreen = canvas.transferControlToOffscreen();
	worker.postMessage({canvas: offscreen}, [offscreen]);
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
	// const ctx = canvas.getContext('2d');
	let drawing = false, x, y, penSize = penSizeInput.value, color = penColorInput.value;
	penSizeInput.onchange = e => {
		// ctx.lineWidth = e.target.value;
		penSize = e.target.value;
		penSizeLabel.innerText = `Pen's size ${e.target.value} `;
	};
	penColorInput.onchange = e => {
		color = e.target.value;
	};
	// ctx.lineJoin = "round";
	// ctx.lineWidth = penSizeInput.value;
	btnDownload.onclick = e => {
		const imgUrl = canvas.toDataURL('image/png');
		e.target.href = imgUrl;
	}

	canvas.addEventListener('mousedown', handleMouseDown);
	canvas.addEventListener('mouseup', handleMouseUp);
	canvas.addEventListener('mouseleave', handleMouseLeave);
	canvas.addEventListener('mouseenter', handleMouseEnter);
	canvas.addEventListener('mousemove', handleMouseMove);

	canvas.addEventListener('touchstart', handleMouseDown);
	// canvas.addEventListener('touchend', handleMouseUp);
	// canvas.addEventListener('touchcancel', handleMouseUp);
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
		worker.postMessage('clear');
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
		const x2 = e.offsetX || (e.touches[0].clientX - e.target.offsetLeft) * scale, y2 = e.offsetY || (e.touches[0].clientY - e.target.offsetTop) * scale;
		if (drawing) draw(x, y, x2, y2, penSize, color);
		x = x2;
		y = y2;
	}
	function handleMouseEnter(e) {
		x = e.offsetX || (e.touches[0].clientX - e.target.offsetLeft) * scale;
		y = e.offsetY || (e.touches[0].clientY - e.target.offsetTop) * scale;
	}
	function handleMouseLeave(e) {
		if (drawing) draw(x, y, e.offsetX || (e.touches[0].clientX - e.target.offsetLeft) * scale, e.offsetY || (e.touches[0].clientY - e.target.offsetTop) * scale);
		drawing = false;
	}
	function handleMouseDown(e) {
		x = e.offsetX || (e.touches[0].clientX - e.target.offsetLeft) * scale;
		y = e.offsetY || (e.touches[0].clientY - e.target.offsetTop) * scale;
		drawing = true;
	};
	function handleMouseUp(e) {
		x = e.offsetX || (e.touches[0].clientX - e.target.offsetLeft) * scale;
		y = e.offsetY || (e.touches[0].clientY - e.target.offsetTop) * scale;
		drawing = false;
	}
	function draw(x1, y1, x2, y2, size = penSize, col = color, isEmit = true) {
		worker.postMessage({x1, y1, x2, y2, size, color: col});
		// ctx.strokeStyle = col;
		// ctx.beginPath();
		// ctx.moveTo(x1, y1);
		// ctx.lineTo(x2, y2);
		// ctx.closePath();
		// ctx.stroke();
		if (isEmit) socket.emit('draw', {x1, y1, x2, y2, size, color:col});
		// console.log('draw');
	};
})();