const clickArea = document.getElementsByClassName('click-area')[0];
const resultEl = document.getElementById('result');
const highScoreEl = document.getElementById('high-score');

let ready = false;
let restart = false;
let time = 0;
let highScore;

const min = (a, b) => a > b ? b : a;
const wait = time => new Promise(res => setTimeout(res, time));
const randRange = (low, high) => low + Math.random() * (high - low);

const Timer = () => {
	let timeout;
	const start = () => {
		timeout = setTimeout(() => {
			clickArea.classList.add('ready');
			time = performance.now();
			ready = true;
		}, randRange(1000, 3000));
	}
	const stop = () => {
		clearTimeout(timeout);
	}
	return {
		start,
		stop,
	}
}
const timer = Timer();
let start = async () => {

}
document.onkeydown = clickArea.onclick = e => {
	if (!ready) {
		resultEl.textContent = 'Mày định hack timeline à?';
		timer.stop();
		timer.start();
		return;
	}
	const reactionTime = (performance.now() - time) >> 0;
	resultEl.textContent = 'Phản xạ là ' + reactionTime + 'ms';
	clickArea.classList.remove('ready');
	ready = false;
	highScore = highScore ? min(reactionTime, highScore) : reactionTime;
	highScoreEl.textContent = highScore + 'ms';
	timer.start();
}

timer.start();
