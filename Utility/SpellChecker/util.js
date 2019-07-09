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

const chain = (...fn) => arg => fn.reduceRight((prev, curr) => curr(pev), arg);

export { debounce, chain };
