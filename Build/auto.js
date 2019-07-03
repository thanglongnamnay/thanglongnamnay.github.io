const fs = require('fs');
const { join, basename } = require('path');
const { JSDOM } = require("jsdom");

const ROOT = join('..');

const ignoredFolders = [
	/\./,
	/Build/
];
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

const getIndexFile = source => new JSDOM(fs.readFileSync(join(source, 'index.html'), { encoding: 'utf8' }));

const getElements = tag => file => file.window.document.querySelectorAll(tag);
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

const getLi = (source, folder) => new Promise((res, rej) => {
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

const main = async root => {
	try {
		const template = await JSDOM.fromFile(join(root, 'template.html'));
		const subDirs = getSubDirectories(root);
		subDirs.forEach(dir => main(join(root, dir)));

		const { document } = template.window;
		const ul = document.getElementById('articles');

		const lis = await Promise.all(subDirs.map(folder => getLi(root, folder)));
		lis.forEach(li => ul.appendChild(li));
		fs.writeFile(join(root, 'index.html'), template.serialize(), handleError());
		console.log('Consider it done.', root);
	} catch(e) {
		console.error(e);
	}
}

main(ROOT);