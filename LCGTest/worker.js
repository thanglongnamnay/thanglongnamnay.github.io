'use strict';
const MAX = -(1 << 31); // nice 32 bits integer
function throttle(fn, delay) {
    let start = Date.now() - delay;
    return function (...args) {
        if (Date.now() - start >= delay) {
            fn.apply(this, args);
            start = Date.now();
        }
    }
}
function average(fn) {
    let sum = 0;
    const post = function(i) {
        self.postMessage({average: sum / i})
    };
    const postDelay = throttle(post, 100);
    for (let i = 1; i <= MAX; ++i) {
        sum += fn();
        postDelay(i);
    }
    return sum / MAX;
}
function distribution(fn, distributionBuffer) {
    const distro = new Uint32Array(distributionBuffer);
    const size = distro.length;
    const post = function(sum) {
        self.postMessage(sum);
    };
    const postDelay = throttle(post, 100);
    for (let i = 0; i < size; ++i) distro[i] = 0;
    for (let i = 0; i < MAX; ++i) {
        const index = (fn() * size) >> 0;
        ++distro[index];
        postDelay(i);
    }
    return distro.map(x => x / MAX);
}
function LCG(a, c, m, x) {
    return function random() {
        x = (a * x + c) % m;
        return x / m;
    }
}
self.onmessage = e => {
    const {a, c, m, x} = e.data.inputs;
    const fn = LCG(a, c, m, x);
    switch (e.data.fuckingThingTodo) {
        case 'average':
            average(fn);
            break;
        case 'distribution':
            distribution(fn, e.data.distributionBuffer);
            break;
    }
};