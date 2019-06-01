'use strict';
function getMean(pixelList) {
	const len = pixelList.length;
	if (len % 4) throw new Error('Wtf, I dont need this.');
	const mean = [0, 0, 0, 0];
	for (let i = 0; i < len; ) {
		for (let j = 0; j < 4; ++j) {
			mean[i % 4] += (pixelList[i++] / len) * 4;
		}
	}
	mean[0] = mean[0] >>> 0;
	mean[1] = mean[1] >>> 0;
	mean[2] = mean[2] >>> 0;
	mean[3] = mean[3] >>> 0;
	return mean;
}
self.onmessage = e => {
	const { x, y, data } = e.data;
	this.postMessage({ x, y, mean: getMean(data) });
};
