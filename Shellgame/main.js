'use strict'
function Shell(ctx, cup, n) {
	let hasBall = false, lifted = false, oldIndex = n, newIndex = n;
	if (n === 1) hasBall = true;
	function getIndex() { return newIndex; }
	function getRect() {
		return {
			x: 200 * newIndex,
			y: 200,
			width: 150,
			height: 200
		}
	}
	function isLifted() { return lifted }
	function clearRect() {
		ctx.clearRect(200 * newIndex, 150, 150, 250);
	}
	function foo(oldIndex, newIndex, percent) {
		const x = [75, 275, 475];
		return (x[oldIndex] + (x[newIndex] - x[oldIndex]) * percent) >> 0;
	}
	function draw(horizentalPercent, verticalPercent = 1) {
		ctx.drawImage(
			cup, 
			foo(oldIndex, 
				newIndex, 
				horizentalPercent) - 75,
			150 + 50 * verticalPercent >> 0, 
			150, 
			200);
		if (horizentalPercent === 1) oldIndex = newIndex;
	}
	function drawBall() {
		ctx.beginPath();
		ctx.arc(75 + 200 * newIndex, 380, 20, 0, 2 * Math.PI);
		ctx.fillStyle ='#9E9E9E';
		ctx.fill();
	}
	function lift(callback = () => {}, ...args) {
		if (lifted) return;
		lifted = true;
		let start;
		const tickLift = (timestamp) => {
			if (!start) { start = timestamp; }
			const process = timestamp - start;
			clearRect();
			if (process < 500) {
				if (hasBall) drawBall();
				draw(0, 1 - process / 500)
				requestAnimationFrame(tickLift)
			} else {
				if (hasBall) drawBall();
				draw(0, 0);
				callback(...args);
			}
		}
		requestAnimationFrame(tickLift);
	}
	function release(callback = () => {}, ...args) {
		if (!lifted) return;
		lifted = false;
		let start;
		const tickRelease = (timestamp) => {
			if (!start) { start = timestamp; }
			const process = timestamp - start;
			clearRect();
			if (process < 500) {
				if (hasBall) drawBall();
				draw(0, process / 500)
				requestAnimationFrame(tickRelease)
			} else {
				if (hasBall) drawBall();
				draw(0, 1);
				callback(...args);
			}
		}
		requestAnimationFrame(tickRelease);
	}
	function setNewIndex(i) { newIndex = i }
	return Object.freeze({
		isLifted,
		getIndex,
		getRect,
		lift,
		release,
		setNewIndex,
		draw
	});
}
(function Game() {
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');
	const speedInput = document.getElementById('time');
	const swapNumberInput = document.getElementById('swapNumber');
	const startBtn = new Image();
	const cup = new Image();
	const arr = [[0,1,2], [0,2,1], [1,0,2], [1,2,0], [2,0,1], [2,1,0]];
	const shells = [Shell(ctx, cup, 0), Shell(ctx, cup, 1), Shell(ctx, cup, 2)];
	let moving = false, gameover = false;
	startBtn.src = 'start.png';
	startBtn.onload = () => { cup.src = 'cup.png' };
	cup.onload = () => {
		shells.forEach(draw);
		ctx.drawImage(startBtn, (canvas.width - startBtn.width) / 2, 70);
		shells.forEach(s => s.lift(() => setTimeout(s.release, 500)));
		const handleStartClick = () => {
			move(swapNumberInput.value);
		};
		const handleCupClick = cupIndex => {
			if (shells[cupIndex].isLifted()) shells[cupIndex].release();
			else shells[cupIndex].lift();
		}
		const handleCanvasClick = e => {
			if (moving) return;
			const mouse = {x: e.offsetX, y: e.offsetY};
			const startBtnRect = {
				x: (canvas.width - startBtn.width) / 2, 
				y: 70,
				width: startBtn.width,
				height: startBtn.height
			};
			const cupRects = shells.map(s => s.getRect());
			if (inRect(mouse, startBtnRect)) {
				handleStartClick();
			} else {
				cupRects.forEach((rect, index) => {
					if (inRect(mouse, rect)) { handleCupClick(index); }
				});
			}
		}
		canvas.addEventListener('click', throttle(handleCanvasClick, 500));
	};
	function suffle() {
		return [...arr[Math.random() * arr.length >> 0]];
	}
	function draw(s) { s.draw(1) }
	function move(repeatTime) { // speed = time to complete translation
		const speed = speedInput.value;
		moving = true;
		shells.forEach(s => s.release());
		const newOrder = suffle();
		for (let i = 0; i < 3; ++i) { shells[i].setNewIndex(newOrder[i]) } 
		let start;
		const tickDraw = (timestamp) => {
			if (!start) { start = timestamp; }
			const process = timestamp - start;
			ctx.clearRect(0, 150, 600, 250);
			if (process < speed) {
				shells.forEach(shell => shell.draw(process / speed));
				requestAnimationFrame(tickDraw)
			} else {
				shells.forEach(draw);
				if (repeatTime > 0) { move(repeatTime - 1); }
				else moving = false;
			}
		}
		requestAnimationFrame(tickDraw);
	}
	function inRect(mouse, rect) {
		return (
			mouse.x >= rect.x 
			&& mouse.y >= rect.y
			&& mouse.x <= rect.x + rect.width 
			&& mouse.y <= rect.y + rect.height);
	}
})();
function throttle(fn, delay) {
    let start = Date.now() - delay;
    return function (...args) {
        if (Date.now() - start >= delay) {
            fn.apply(this, args);
            start = Date.now();
        }
    }
}