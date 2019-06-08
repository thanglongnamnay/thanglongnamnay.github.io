function Utility() {
	'use strict';
	function Prime() {
		function isPrime(n) {
			M = 1000000007n;
			if (typeof n === 'object') throw 'Should not pass an object to function isPrime';
			if (typeof n !== 'string') 
				if (typeof n !== 'bigint' || number(n) < 1e6) return naive(Number(n));
				return millerRabin(n, LCG(23n, 0n, M, 69n), M);
			return isPrime(BigInt(n));

			function naive(n) {
				if (n < 3) return true;
				if (n % 2 === 0) return false;
				for (let i = 3; i * i <= n; i += 2) {
					if (n % i === 0) return false;
				}
				return true;
			}
			function millerRabin(n, randomGenerator, M) {
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
				let i = 0;
				while (p & 1n) {
					++i;
					p = p >> 1n;
				}
				return [i, p];
			}
		}
		function checkBigint(...numbers) {
			for (n of numbers) 
				if (typeof n !== 'bigint') throw `[${numbers}] need to be BigInt.`;
			return true;
		}
		function GCD(a, b) {
			checkBigint(a, b);
			while (b !== 0n) {
				const temp = b;
				b = a % b;
				a = temp;
			}
			return a;
		}
		function modPower(a, b, p) {
			checkBigint(a, b, b);
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
		return Object.freeze({
			isPrime,
			GCD,
			modPower,
			LCG
		});
	}

	function LinearEquations() {
		function Vector(n) {
			let V = [];
			// methods
			function set(i, value) { V[i] = value; }
			function get(i) { return V[i]; }
			function input(list) { V = list; }
			function plus(V2) {
				const result = Vector(n);
				for (let i = 0; i < n; ++i) {
					result.set(i, V[i] + V2.get(i));
				}
				return result;
			}
			function minus(V2) {
				const result = Vector(n);
				for (let i = 0; i < n; ++i) {
					result.set(i, V[i] - V2.get(i));
				}
				return result;
			}
			function mult(delta) {
				const result = Vector(n);
				for (let i = 0; i < n; ++i) {
					result.set(i, V[i] * delta);
				}
				return result;
			}
			function divide(delta) {
				const result = Vector(n);
				for (let i = 0; i < n; ++i) {
					result.set(i, V[i] / delta);
				}
				return result;
			}
			function output(log) {
				let outputString = '';
				for (let i = 0; i < n - 1; ++i) {
					outputString += 'x' + i + ' = ' + (+V[i].toFixed(8)) + ', ';
				}
				outputString += 'x' + (n-1) + ' = ' + (+V[n-1].toFixed(8));
				if (log) log(outputString);
				return outputString;
			}
			return Object.freeze({
				input,
				set,
				get,
				plus,
				minus,
				mult,
				divide,
				output
			});
		}
		function NoRoot() {
			return Object.freeze({
				output: function(log) { 
					log('Vô nghiệm!');
					return 'Vô nghiệm!';
				}
			});
		}
		function InfRoot() {
			return Object.freeze({
				output: function(log) { 
					log('Vô số nghiệm!');
					return 'Vô số nghiệm!';
				}
			});
		}
		function SquaredMatrix(n) {
			let V = [];
			for (let i = 0; i < n; ++i) {
				V.push(Vector(n + 1));
			}
			// methods
			function input(list) {
				for (let i = 0; i < n; ++i) {
					V[i].input(list[i]);
				}
			}
			function swap(i, j) {
				const temp = V[i].clone();
				V[i] = V[j];
				V[j] = temp;
			}
			function swapMax(i) {
				let m = i;
				for (let j = i + 1; j < n; ++j) {
					if (Math.abs(V[j].get(i)) > Math.abs(V[m].get(i)))
						m = j;
				}
				swap(i, m);
			}
			function reduce() {
				for (let i = 0; i < n - 1; ++i) {
					swapMax(i);
					for (let j = i + 1; j < n; ++j) {
						V[j] = V[i].mult(V[j].get(i) / V[i].get(i)).minus(V[j]);
					}
				}
			}
			function findRoot() {
				reduce();
				const X = Vector(n);
				for (let i = n - 1; i >= 0; --i) {
					let t = V[i].get(n);
					for (let j = n - 1; j > i; --j) {
						t -= X.get(j) * V[i].get(j);
					}
					if (V[i].get(i) === 0) 
						if (t === 0) return InfRoot();
						else return NoRoot();
					X.set(i, t / V[i].get(i));
				}
				return X;
			}
			function output(log) {
				for (let i = 0; i < n; ++i) {
					V[i].output(log);
				}
			}
			return Object.freeze({
				input,
				findRoot,
				output
			})
		}
		return Object.freeze({
			SquaredMatrix,
			Vector
		})
	}

	return Object.freeze({
		Prime,
		LinearEquations
	});
}
