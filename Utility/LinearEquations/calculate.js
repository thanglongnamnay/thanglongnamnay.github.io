'use strict';
function Calculate() {
	function VectorN(n) {
		let V = [];
		// methods
		function set(i, value) { V[i] = value; }
		function get(i) { return V[i]; }
		function input(list) { V = list; }
		function plus(V2) {
			const result = VectorN(n);
			for (let i = 0; i < n; ++i) {
				result.set(i, V[i] + V2.get(i));
			}
			return result;
		}
		function minus(V2) {
			const result = VectorN(n);
			for (let i = 0; i < n; ++i) {
				result.set(i, V[i] - V2.get(i));
			}
			return result;
		}
		function mult(delta) {
			const result = VectorN(n);
			for (let i = 0; i < n; ++i) {
				result.set(i, V[i] * delta);
			}
			return result;
		}
		function divide(delta) {
			const result = VectorN(n);
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
		function clone() {
			let input = [...V];
			let clone = VectorN(n);
			clone.input(input);
			return clone;
		}
		return Object.freeze({
			input,
			set,
			get,
			plus,
			minus,
			mult,
			divide,
			output,
			clone
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
			V.push(VectorN(n + 1));
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
			const X = VectorN(n);
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
	return Object.freeze({SquaredMatrix})
}
// exports default SquaredMatrix;