const { spawn } = require('child_process');

module.exports = function live(out = process.stdout, err = process.stderr) {
	const live = spawn('cmd', ['/c', 'set DEBUG=* & rserver --path d:/thanglongnamnay.github.io --exception sw.*js']);
	live.stdout.pipe(out);
	live.stderr.pipe(err);
}