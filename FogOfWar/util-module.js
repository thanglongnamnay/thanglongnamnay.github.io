'use strict';
function Util(scale) {
    function randomColor() {
        return '#' + randomShade() + randomShade() + randomShade();
    }
    function randomShade() {
        let s = (Math.random() * 256 >> 0).toString(16);
        if (s.length < 2) s = '0' + s;
        return s;
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
        if (!fn) return fn;
        let start = Date.now() - delay;
        return function (...args) {
            if (Date.now() - start >= delay) {
                fn.apply(this, args);
                start = Date.now();
            }
        }
    }
    function debounce(fn, delay) {
        if (!fn) return fn;
        let timeout;
        return function (...args) {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(fn, delay, ...args);
        }
    }
    return {
        set scale(v) { scale = v; },
        randomColor,
        getXY,
        round,
        throttle,
        debounce,
    }
}
export default Util;