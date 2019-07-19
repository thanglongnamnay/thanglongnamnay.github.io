const { join } = require('path');

module.exports = async function minify(root, des, path) {
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