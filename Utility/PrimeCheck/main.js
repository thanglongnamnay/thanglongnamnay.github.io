const $ = id => document.getElementById(id);
(function main(numberInput, outputP, checkButton) {
	'use strict';
	const worker = new Worker('worker.js');
	checkButton.onclick = e => {
		worker.postMessage(BigInt(numberInput.value));
		checkButton.disabled = true;
		outputP.textContent = 'Đang tính...';
		worker.onmessage = e => {
			outputP.textContent = e.data; 
			checkButton.disabled = false;
		}
	}
})($('number'), $('output'), $('check'));