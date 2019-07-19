const { join } = require('path');
const { JSDOM } = require("jsdom");

const minify = (root, des, filename) => {
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