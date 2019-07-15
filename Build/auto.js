const fs = require('fs').promises;
const { minify} = require('html-minifier');
const jsMinify = require('uglify-es').minify;
const { join, basename, relative, sep } = require('path');
const { JSDOM } = require("jsdom");

const ROOT = join(__dirname, '..');

const ignoredFolders = [
	/\./,
	/Build/,
	/commons/,
	/CNAME/,
	/server/,
];
const commonFolder = join(ROOT, 'commons');
const commonFiles = {
	css: ['style.css'],
	js: ['breadcrumb.js'],
};
const commonMetas = `<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="shortcut icon" type="image/png" href="/commons/icon.png"/>`;

const handleError = (cb = console.error) => err => {
	if (err) cb(err);
}
const unary = fn => arg => fn(arg);
const isNotIgnored = ignoredFolders => name => !ignoredFolders.some(reg => reg.test(name));
const isDirectory = source => fs.stat(source).then(stat => stat.isDirectory());
const toFullSource = source => name => join(source, name);
const getSubDirectories = source => 
	fs.readdir(source)
		.then(names => names.map(toFullSource(source)))
		.then(names => names.filter(isDirectory))
		.then(names => names.map(unary(basename)))
		.then(names => names.filter(isNotIgnored(ignoredFolders)));

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
	const indexFile = join(source, folder, 'template.html');
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

const main = async (root, des) => {
	try {
		// clean(root);
		// minifyJs(root);
		buildHtml(root, des);
	} catch(e) {
		console.error(e);
	}
}

const safeWriteFile = async (source, data) => {
	await fs.mkdir(basename(source));
	return await fs.writeFile(source, data);
}

const buildHtml = async (root, path, des) => {
	const source = join(root, path);
	const template = await JSDOM.fromFile(join(source, 'template.html'));
	const subDirs = await getSubDirectories(source);

	const { document } = template.window;
	document.head.innerHTML += commonMetas;
	document.head.innerHTML += commonFiles.css.map(name => getStyleHTML(join(commonFolder, name))).join('')
	document.body.innerHTML += commonFiles.js.map(name => getScriptHTML(join(commonFolder, name))).join('');

	const ul = document.getElementById('articles');
	if (ul) {
		(await Promise.all(subDirs.map(folder => getLi(source, folder))))
			.forEach(li => ul.appendChild(li));
	}

	await safeWriteFile(
		join(root, des, 'index.html'), 
		minify(template.serialize(), minifyOptions), 
	);
	subDirs.map(dir => buildHtml(join(source, dir)));
}

const unminifiedRegex = /(?<!min)\.js$/g;
const minifiedRegex = /(?<=min)\.js$/g;

const readFile = async source => {
	try {
		const data = await fs.readFile(source);
		console.log('READ:', source);
		return { source, data };
	} catch (e) {
		console.log('READ:', source, e.message);
	}
}

const clean = async root => {
	const names = await fs.readdir(root);
	const jsNames = names.filter(name => minifiedRegex.test(name));
	jsNames.forEach(name => fs.unlink(join(root, name)));
}

const minifyJs = async root => {
	const names = await fs.readdir(root);
	const jsNames = names.filter(name => unminifiedRegex.test(name));

	console.log('NAMES:', jsNames);
	const files = await Promise.all(jsNames.map(name => readFile(join(root, name))));
	files.forEach(({ source, data } = {}) => {
		if (source && data) {
			console.log('WRITE:', source.replace(unminifiedRegex, '.min.js'));
			const minified = jsMinify(data);
			if (minified.error) return console.error('MINIFY:', source, minified.error);
			fs.writeFile(source.replace(unminifiedRegex, '.min.js'), minified.data) ;
		}
	});
}

main(ROOT);