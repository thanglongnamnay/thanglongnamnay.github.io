import { debounce, chain } from './util.js';

const dictionary = {};
const marks = `.,?!()'"`;
const delims = /[\d\.,\?\!\(\)\'\"\-\:\=\+\*/]/g;

const seperate = text => text.replace(delims, ' ');

const removeRedundanceSpaces = text => text.replace(/[\u00a0 ]{2,}/g, ' ');

const addSpaceAfterMark = text => text.replace(/[\.,\?\!\)-](?! )/g, '$& ');

const standalize = text => {
	return addSpaceAfterMark(removeRedundanceSpaces(text));
}

const removeMark = uglyWord => {
	if (uglyWord.length === 0) return uglyWord;
	return uglyWord.replace(delims, '');
	let word = uglyWord;
	while (marks.includes(word[0])) word = word.slice(1);
	while (marks.includes(word[word.length - 1])) word = word.slice(0, -1);
	return word;
}

const checker = meaningfulWords => {
	const dictionary = {};

	const check = async uglyWord => {
		if (uglyWord.length === 0) return true;

		const word = removeMark(uglyWord).toLocaleLowerCase('vi');
		if (dictionary[word] != undefined) return dictionary[word];
		if (meaningfulWords.includes(word)) {
			dictionary[word] = true;
			return true;
		}

		const fetchResult = await fetch(`https://dict.laban.vn/ajax/widget-search?type=1&query=${word}&vi=1`);
		const respond = await fetchResult.json();
		if (respond.error !== 0) throw Error('Network error.');

		dictionary[word] = respond.viEnData ? !!respond.viEnData.best : false;
		return dictionary[word];
	}

	return {
		check,
		get dictionary() { return dictionary; },
	}
};

const textInput = document.getElementById('text-input');
const checkButton = document.getElementById('check-button');

const notEmpty = word => word.length > 0;
const empty = word => word.length === 0;

const handleCheck = checker => async e => {
	console.log(standalize(textInput.textContent));
	textInput.innerHTML = standalize(textInput.textContent);
	const words = seperate(textInput.textContent).split(/\s/).map(removeMark).filter(notEmpty);
	console.log(words);

	for (let i = 0; i < words.length; ++i) {
		const w = words[i];
		if ((w - 0).toString() === w) return;

		if (!await checker.check(w)) {
			const prevW = (words[i - 1] || '') + ' ' + w;
			const nextW = w + ' ' + (words[i + 1] || '');

			if (!await checker.check(prevW) && !await checker.check(nextW)) {
				textInput.innerHTML = textInput.innerHTML.replace(RegExp(/(\W)/.source + RegExp(w).source + /(\W)/.source, 'g'), '$1<span class="wrong">' + w + '</span>$2');
			}
		}

		// if (!await hasMeaning(w)) {
		// 	const prevW = (words[i - 1] || '') + ' ' + w;
		// 	const nextW = w + ' ' + (words[i + 1] || '');
		// 	const prevMeaning = await hasMeaning(prevW);
		// 	const nextMeaning = await hasMeaning(nextW);

		// 	console.log(w, prevW, nextW, prevMeaning, nextMeaning);

		// 	if (!prevMeaning && !nextMeaning) {
		// 		textInput.innerHTML = textInput.innerHTML.replace(RegExp(w, 'g'), `<span class="wrong">${w}</span>`);
		// 	}
		// }
	};
}

const main = async () => {
	const meaningfulWords = await (await fetch('./vv30K_lst.json')).json();
	console.log("LIST:", meaningfulWords);
	console.log('FIND:', meaningfulWords.indexOf('xôi'));

	checkButton.onclick = handleCheck(checker(meaningfulWords));
}

main();
