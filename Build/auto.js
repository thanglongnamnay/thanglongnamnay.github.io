const fs = require('fs').promises;
const { watch } = require('fs');
const { F_OK } = require('fs').constants;
const { minify} = require('html-minifier');
const jsMinify = require('terser').minify;
const { join, basename, dirname, extname, relative, sep } = require('path');
const { JSDOM } = require("jsdom");
const live = require('./live');

// const ROOT = join(__dirname, 'page-src');

const DES = join('d:/', 'thanglongnamnay.github.io');
const ROOT = DES;

const regex = {
	notFolder: /\./,
	html: /html$/,
	js: /js$/,
	css: /css$/,
	json: /json$/,
	unminifiedJs: /(?<!min)\.js/,
	minifiedJs: /(?<=min)\.js/,
}

const ignoredFolders = [
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

const minifyOptions = {
	collapseWhitespace: 1,
	conservativeCollapse: 1,
	minifyCSS: 1,
	minifyJS: 1,
	includeAutoGeneratedTags: 0,
}

const safeWriteFile = async (source, data) => {
	try {
		await fs.mkdir(dirname(source));
	} catch(e) {
		console.error(e);
	}
	return await fs.writeFile(source, data);
}

const main = async (root, des) => {
	// minifyJs(root, des, '.');
	// const tree = await buildHtml(root, des, '.');
	// console.dir(tree, {
	// 	depth: 5,
	// 	colors: true,
	// });

	live(process.stdout, process.stderr);

	console.log('WATCHING...');
	watch(root, { recursive: true }, throttle((type, filename) => {
		const source = join(root, filename);
		console.log(type, source);
		if (type !== 'change') return;
		if (ignoredFolders.some(name => name.test(dirname(source)))) return;

		if (regex.unminifiedJs.test(filename)) {
			fs.readFile(source, 'utf8')
				.then(data => {
					const minified = jsMinify(data.replace(RegExp(regex.unminifiedJs, 'g'), '.min.js'));
					if (minified.error) return console.error('MINIFY:', source, minified.error);
					safeWriteFile(source.replace(regex.unminifiedJs, '.min.js'), minified.code) ;
				}).catch(handleError);
		} else if (basename(filename) === 'template.html') {
			const dir = dirname(join(des, filename));

			JSDOM.fromFile(join(root, filename)).then(template => {
				const { document } = template.window;
				document.head.innerHTML += commonMetas;
				document.head.innerHTML += commonFiles.css.map(name => getStyleHTML(join(commonFolder, name))).join('')
				document.body.innerHTML += commonFiles.js.map(name => getScriptHTML(join(commonFolder, name))).join('');

				safeWriteFile(
					join(dir, 'index.html'), 
					minify(
						template
							.serialize()
							.replace(RegExp(regex.unminifiedJs, 'g'), '.min.js'),
						minifyOptions,
					),
				);
			}).catch(handleError);
		}
	}, 30));
}

const buildHtml = async (root, des, path) => {
	const source = join(root, path);
	// clean(source);
	const subDirs = await getSubDirectories(source);
	const subEls = await Promise.all(subDirs.map(dir => buildHtml(root, des, join(path, dir))));
	try {
		const template = await JSDOM.fromFile(join(source, 'template.html'));

		const { document } = template.window;
		document.head.innerHTML += commonMetas;
		document.head.innerHTML += commonFiles.css.map(name => getStyleHTML(join(commonFolder, name))).join('')
		document.body.innerHTML += commonFiles.js.map(name => getScriptHTML(join(commonFolder, name))).join('');

		const ul = document.getElementById('articles');
		if (ul) {
			subEls.forEach(info =>  {
				if (!info) return;
				const li = document.createElement('li');
				li.textContent = ' - ' + info.description;

				const a = document.createElement('a');
				a.textContent = info.title;
				a.href = info.source;

				li.insertBefore(a, li.firstChild);
				ul.appendChild(li);
			});
		}

		await safeWriteFile(
			join(des, path, 'index.html'), 
			minify(
				template
					.serialize()
					.replace(RegExp(regex.unminifiedJs, 'g'), '.min.js'),
				minifyOptions,
			),
		);

		return {
			source: basename(source),
			...getInfo(template),
			sub: subEls,
		}
	} catch(e) {
		console.error(e);
	}
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

const clearFilter = name => regex.notFolder.test(name) && 
	!regex.html.test(name) && 
	!regex.css.test(name) && 
	!regex.json.test(name) && 
	!regex.unminifiedJs.test(name);

const clean = async root => {
	const names = await fs.readdir(root);
	const clears = names.filter(clearFilter);
	console.log('CLEAR:', root,names, clears);
	clears.forEach(name => delFile(join(root, name)));
	delFile(join(root, 'index.html'));
}

const minifyJs = async (root, des, path) => {
	try {
	const dir = join(root, path)
	const subDirs = await getSubDirectories(dir);
	console.log('DIRS:', dir, subDirs);
	subDirs.forEach(subDir => minifyJs(root, des, join(path, subDir)));

	const names = await fs.readdir(dir);
	const jsNames = names.filter(name => regex.unminifiedJs.test(name));

	console.log('NAMES:', jsNames);

	// jsNames.forEach(name => {
	// 	const input = join(root, path, name);
	// 	const output = join(des, path, name).replace(regex.unminifiedJs, '.min.js');
	//(`terser ${input} -o ${output}`)
	// 	// .on('close', code => {
	// 	// 	console.log(code, 'Minify: ' + imput + ' -> ' + output);
	// 	// });
	// });

	// return;

	const files = await Promise.all(jsNames.map(name => readFile(join(dir, name))));

	files.forEach(({ source, data } = {}) => {
		if (source && data) {
			const name = basename(source);
			const outputName = join(des, path, name).replace(regex.unminifiedJs, '.min.js');
			console.log('WRITE:', outputName);
			const minified = jsMinify(data.replace(RegExp(regex.unminifiedJs, 'g'), '.min.js'));
			if (minified.error) return console.error('MINIFY:', source, minified.error);
			// console.log('MINIFY:', source, minified.code);
			safeWriteFile(source.replace(regex.unminifiedJs, '.min.js'), minified.code) ;
		}
	});
	} catch (e) {console.error(e)}
}

main(ROOT, DES);

function throttle(fn, delay) {
    let start = Date.now() - delay;
    return function (...args) {
        if (Date.now() - start >= delay) {
            fn.apply(this, args);
            start = Date.now();
        }
    }
}