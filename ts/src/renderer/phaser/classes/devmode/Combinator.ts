const increase = function* (start: number, end: number, step = 1) {
	while (start <= end) {
		yield start;
		start += step;
	}
};

const decrease = function* (start: number, end: number, step = 1) {
	while (start >= end) {
		yield start;
		start -= step;
	}
};

const range = function (start: number, end: number, step = 1) {
	if (start < end) {
		return increase(start, end, Math.abs(step));
	} else {
		return decrease(start, end, Math.abs(step));
	}
};

const toggle = function* (a: Generator, b: Generator) {
	while (true) {
		let valueA = a.next();
		let valueB = b.next();
		if (valueA.done && valueB.done) {
			break;
		}
		if (!valueA.done) {
			yield valueA.value;
		}
		if (!valueB.done) {
			yield valueB.value;
		}
	}
};

const equal = function* (start: number) {
	yield start;
};

const spread = function (start: number, end: number, step = 1) {
	if (start === end) {
		return equal(start);
	}
	let middle = Math.floor((end + start) / 2);
	return toggle(
		range(middle, start, step),
		range(middle + step, end, step)
	);

};

const rect = function* (x: number, y: number) {
	let _x = range(0, x - 1);

	while (true) {
		let valueX = _x.next();
		if (valueX.done) {
			break;
		} else {
			let _y = range(0, y - 1);
			while (true) {
				let valueY = _y.next();
				if (valueY.done) {
					break;
				} else {
					yield { x: valueX.value, y: valueY.value };
				}
			}
		}
	}


};

const circle = function* (radius: number) {
	if (radius < 1) {
		throw ('radius must greater than 1');
	}
	let rightIndex = (radius - 1) * 2;
	let _y = spread(0, rightIndex);
	let distance = 0;

	while (true) {
		let valueY = _y.next();
		if (valueY.done) {
			break;
		} else {
			let chord = Math.ceil(Math.sqrt(radius ** 2 - Math.floor(distance) ** 2) - 0.1);
			let _x = spread(0 + radius - chord , rightIndex - radius + chord);
			while (true) {
				let valueX = _x.next();
				if (valueX.done) {
					if (distance === 0) {
						distance += 1;
					} else {
						distance += 0.5;
					}
					break;
				} else {
					yield { x: valueX.value, y: valueY.value };
				}
			}
		}
	}
};


const diamond = function* (radius: number) {
	if (radius < 1) {
		throw ('radius must greater than 1');
	}
	let rightIndex = (radius - 1) * 2;
	let _y = spread(0, rightIndex);
	let distance = 0;

	while (true) {
		let valueY = _y.next();
		if (valueY.done) {
			break;
		} else {
			let _x = spread(0 + Math.floor(distance), rightIndex - Math.floor(distance));
			while (true) {
				let valueX = _x.next();
				if (valueX.done) {
					if (distance === 0) {
						distance += 1;
					} else {
						distance += 0.5;
					}
					break;
				} else {
					yield { x: valueX.value, y: valueY.value };
				}
			}
		}
	}
};

