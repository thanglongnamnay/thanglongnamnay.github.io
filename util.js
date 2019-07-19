const { join } = require('path');
const fs = require('fs').promises;

const handleError = (cb = console.error) => err => {
	if (err) cb(err);
}
const unary = fn => arg => fn(arg);
const isNotIgnored = ignoredFolders => name => !ignoredFolders.some(reg => reg.test(name));
const isDirectory = source => fs.stat(source).then(stat => stat.isDirectory()).catch(handleError);
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
const relativePosix = (src, des) => relative(src, des).split(sep).join('/');

const getStyleHTML = source => `<link rel="stylesheet" href="/${relativePosix(ROOT, source)}">`;
const getScriptHTML = source => `<script src="/${relativePosix(ROOT, source)}"></script>`;

const safeWriteFile = async (source, data) => {
	try {
		await fs.mkdir(dirname(source));
	} catch(e) {
		console.error(e);
	}
	return await fs.writeFile(source, data);
}

const readFile = async source => {
	try {
		const data = await fs.readFile(source, 'utf8');
		console.log('READ:', source);
		return { source, data };
	} catch (e) {
		console.log('READ:', source, e.message);
	}
}

const delFile = source => {
	try {
		fs.unlink(source);
	} catch {}
}