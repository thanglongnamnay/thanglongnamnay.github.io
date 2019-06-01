const M = 1000000007n;
const randomGenerator = LCG(23n, 0n, M, 69n);

self.onmessage = e => {
	let n = e.data;
	if (n < 1n) {
		self.postMessage('Bạn phải nhập số dương.');
		return;
	}
	let isPrime;
	if (n < BigInt(1e6)) isPrime = naive(Number(n));
	else isPrime = millerRabin(n);

	if (isPrime) self.postMessage('Nguyên tố.');
	else self.postMessage('Hợp số.');
}

function naive(n) {
	if (n < 3) return true;
	if (n % 2 === 0) return false;
	for (let i = 3; i * i <= n; i += 2) {
		if (n % i === 0) return false;
	}
	return true;
}
function millerRabin(n) {
	let a = randomGenerator.random() * (n - 2n) / M + 2n;
	if (GCD(a, n) !== 1n) return false;
	if (modPower(a, n - 1n, n) !== 1n) return false;
	return witness(a, n);
}
function witness(a, n) {
	let [k, m] = decompose(n - 1n);
	let b0 = modPower(a, m, n), b1;
	if (b0 === 1n) return true;
	let i = 1n;
	while (i < k) {
		b1 = (b0 * b0) % n;
		if (b1 === 1n) {
			if (b0 === n - 1) return true;
			return false;
		}
		b0 = b1;
	}
	return false;
}
function decompose(p) {
	let i = 0n;
	while (p & 1n) {
		++i;
		p = p >> 1n;
	}
	return [i, p];
}
function GCD(a, b) {
	while (b !== 0n) {
		const temp = b;
		b = a % b;
		a = temp;
	}
	return a;
}
function modPower(a, b, p) {
	if (b === 1n) return a;
	const x = modPower(a, b/2n, p);
	if (b & 1n) return (x * x * a) % p;
	return (x * x) % p;
}
function LCG(a, c, m, x) {
    return {
    	random: function() {
	        x = (a * x + c) % m;
	        return x;
	    }
	}
}