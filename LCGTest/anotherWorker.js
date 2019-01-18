'use strict';
const MAX = 1e9;
let DISTRIBUTE_PART;

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
    post(MAX);
    return sum / MAX;
}

function distribution(fn, size) {
    const distro = [];
    const post = function() {
        self.postMessage({distribution: distro});
    };
    const postDelay = throttle(post, 100);
    for (let i = 0; i < size; ++i) distro.push(0);
    for (let i = 0; i < MAX; ++i) {
        const index = (fn() * size) >> 0;
        ++distro[index];
        postDelay();
    }
    return distro.map(x => x / MAX);
}

self.onmessage = e => {
    if (e.data.DISTRIBUTE_PART) DISTRIBUTE_PART = e.data.DISTRIBUTE_PART;
    let fn;
    switch (e.data.type) {
        case 'Math.random' :
            fn = Math.random;
            break;
        default:
            fn = Math.random;
    }
    distribution(fn, DISTRIBUTE_PART);
};
