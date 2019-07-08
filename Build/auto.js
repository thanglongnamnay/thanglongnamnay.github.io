const fs = require('fs');
var { minify } = require('html-minifier');
const { join, basename, relative, sep } = require('path');
const { JSDOM } = require("jsdom");

const ROOT = join(__dirname, '..');

const ignoredFolders = [
	/\./,
	/Build/,
	/commons/,
];
const commonFolder = join(ROOT, 'commons');
const commonFiles = {
	css: ['style.css'],
	js: ['breadcrumb.js'],
};
const commonMetas = `<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="shortcut icon" type="image/png" href="/icon.png"/>`;

const handleError = (cb = console.error) => err => {
	if (err) cb(err);
}
const unary = fn => arg => fn(arg);
const isNotIgnored = ignoredFolders => name => !ignoredFolders.some(reg => reg.test(name));
const isDirectory = source => fs.lstatSync(source).isDirectory();
const toFullSource = source => name => join(source, name);
const getSubDirectories = source => 
	fs.readdirSync(source)
		.map(toFullSource(source))
		.filter(isDirectory)
		.map(unary(basename))
		.filter(isNotIgnored(ignoredFolders))

const getElement = tag => file => file.window.document.querySelector(tag);
const getTitle = file => getElement('title')(file).textContent;
const getDescription = file => getElement('meta[name="description"]')(file)
		.attributes
		.getNamedItem('content')
		.textContent;
const getInfo = file => ({
	title: getTitle(file),
	description: getDescription(file)
});

const getLi = (source, folder) => new Promise(res => {
	const indexFile = join(source, folder, 'index.html');
	JSDOM.fromFile(indexFile).then(dom => {
		const info = getInfo(dom);
		const { document } = dom.window;
		const li = document.createElement('li');
		li.textContent = ' - ' + info.description;

		const a = document.createElement('a');
		a.textContent = info.title;
		a.href = folder;

		li.insertBefore(a, li.firstChild);
		res(li);
	});
});

const relativePosix = (src, des) => relative(src, des).split(sep).join('/');

const getStyleHTML = source => `<link rel="stylesheet" href="/${relativePosix(ROOT, source)}">`;
const getScriptHTML = source => `<script src="/${relativePosix(ROOT, source)}"></script>`;

const minifyOptions = {
	collapseWhitespace: 1,
	conservativeCollapse: 1,
}

const main = async source => {
	try {
		const template = await JSDOM.fromFile(join(source, 'template.html'));
		const subDirs = getSubDirectories(source);
		subDirs.forEach(dir => main(join(source, dir)));

		const { document } = template.window;
		document.head.innerHTML += commonMetas;
		document.head.innerHTML += commonFiles.css.map(name => getStyleHTML(join(commonFolder, name))).join('')
		document.body.innerHTML += commonFiles.js.map(name => getScriptHTML(join(commonFolder, name))).join('');

		const ul = document.getElementById('articles');

		if (ul) {
			(await Promise.all(subDirs.map(folder => getLi(source, folder))))
				.forEach(li => ul.appendChild(li));
		}

		fs.writeFile(
			join(source, 'index.html'), 
			minify(template.serialize(), minifyOptions), 
			handleError(),
		);
	} catch(e) {
		console.error(e);
	}
}

main(ROOT);