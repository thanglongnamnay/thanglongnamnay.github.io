import Calculate from './calculate.js';
const $ = id => document.getElementById(id);
(function main(matrixSizeInput , createButton, calculateButton, tableSection) {
	'use strict';
	const create = tagName => document.createElement(tagName);
	HTMLElement.prototype.appendChilds = function(...childs) {
		for (const child of childs) {
			this.appendChild(child);
		}
	}

	createButton.onclick = e => {
		tableSection.innerHTML = '';
		const n = parseFloat(matrixSizeInput.value);
		const table = createTable(n);
		tableSection.appendChild(table.container);
		const inputList = table.inputList;
		calculateButton.disabled = false;
		
		calculateButton.onclick = e => {
			const matrix = Calculate().SquaredMatrix(n);
			matrix.input(inputList.map(toArray(2)));
			const root = matrix.findRoot();
			table.resultP.textContent = root.output(console.log);
			table.noteP.innerHTML = 'Thi thoảng số sẽ không chính xác 100% vì cách biểu diễn double theo <a href="https://en.wikipedia.org/wiki/IEEE_754">IEEE 754</a>.';
		}
	}

	function toArray(dim) {
		if (dim === 1) {
			return function(input) {
				return parseFloat(input.value);
			}
		}
		return function(inputList) {
			return inputList.map(toArray(dim - 1))
		}
	}

	function createLastInput() {
		const label = create('label');
		label.textContent = ` = `;
		const input = create('input');
		input.type = 'number';
		input.value = '0';
		input.classList.add('number-input');
		const container = create('span');
		container.appendChilds(label, input);
		return {container, input};
	}

	function createInput(n, i, j) {
		const label = create('label');
		label.textContent += `.x${j}`;
		if (j < n-1) label.textContent += ' + ';
		const input = create('input');
		input.type = 'number';
		input.value = '0';
		input.classList.add('number-input');
		const container = create('span');
		container.appendChilds(input, label);
		return {container, input};
	}

	function createRow(n, row) {
		const container = create('div');
		container.classList.add('row');	
		const inputList = [];
		for (let i = 0; i < n; ++i) {
			const inputContainer = createInput(n, row, i);
			container.appendChild(inputContainer.container);
			inputList.push(inputContainer.input);
		}
		const lastInput = createLastInput();
		container.appendChild(lastInput.container);
		inputList.push(lastInput.input);
		return {container, inputList};
	}

	function createTable(n) {
		const container = create('div');
		const inputList = [];
		for (let i = 0; i < n; ++i) {
			const rowContainer = createRow(n, i);
			container.appendChild(rowContainer.container);
			inputList.push(rowContainer.inputList);
		}
		const resultP = create('p');
		resultP.id = 'result';
		container.appendChild(resultP);
		const noteP = create('p');
		noteP.id = 'result';
		container.appendChild(noteP);
		return {container, resultP, noteP, inputList};
	}
})($('matrix-size'), $('create'), $('calculate'), $('table'));


