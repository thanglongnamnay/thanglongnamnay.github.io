'use strict';
function randomColor() {
    return '#' + (Math.random() * 256 * 256 * 256 >> 0).toString(16);
}

function getXY(e) {
    return e.offsetX ? ({
        x: e.offsetX * scale,
        y: e.offsetY * scale
    }) : ({
        x: e.touches[0].clientX - e.target.offsetLeft * scale,
        y: e.touches[0].clientY - e.target.offsetTop * scale
    })
}

function round(x) {
	return x;
}

function throttle(fn, delay) {
    let start = Date.now() - delay;
    return function (...args) {
        if (Date.now() - start >= delay) {
            fn.apply(this, args);
            start = Date.now();
        }
    }
}