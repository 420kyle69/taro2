class Combinator {
}
Combinator.increase = function* (start, end, step = 1) {
    while (start <= end) {
        yield start;
        start += step;
    }
};
Combinator.decrease = function* (start, end, step = 1) {
    while (start >= end) {
        yield start;
        start -= step;
    }
};
Combinator.range = function (start, end, step = 1) {
    if (start < end) {
        return Combinator.increase(start, end, Math.abs(step));
    }
    else {
        return Combinator.decrease(start, end, Math.abs(step));
    }
};
Combinator.toggle = function* (a, b) {
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
Combinator.equal = function* (start) {
    yield start;
};
Combinator.spread = function (start, end, step = 1) {
    if (start === end) {
        return Combinator.equal(start);
    }
    let middle = Math.floor((end + start) / 2);
    return Combinator.toggle(Combinator.range(middle, start, step), Combinator.range(middle + step, end, step));
};
Combinator.rect = function* (x, y) {
    let _x = Combinator.range(0, x - 1);
    while (true) {
        let valueX = _x.next();
        if (valueX.done) {
            break;
        }
        else {
            let _y = Combinator.range(0, y - 1);
            while (true) {
                let valueY = _y.next();
                if (valueY.done) {
                    break;
                }
                else {
                    yield { x: valueX.value, y: valueY.value };
                }
            }
        }
    }
};
Combinator.circle = function* (radius) {
    if (radius < 1) {
        throw ('radius must greater than 1');
    }
    let rightIndex = (radius - 1) * 2;
    let _y = Combinator.spread(0, rightIndex);
    let distance = 0;
    while (true) {
        let valueY = _y.next();
        if (valueY.done) {
            break;
        }
        else {
            let chord = Math.ceil(Math.sqrt(Math.pow(radius, 2) - Math.pow(Math.floor(distance), 2)) - 0.1);
            let _x = Combinator.spread(0 + radius - chord, rightIndex - radius + chord);
            while (true) {
                let valueX = _x.next();
                if (valueX.done) {
                    if (distance === 0) {
                        distance += 1;
                    }
                    else {
                        distance += 0.5;
                    }
                    break;
                }
                else {
                    yield { x: valueX.value, y: valueY.value };
                }
            }
        }
    }
};
Combinator.diamond = function* (radius) {
    if (radius < 1) {
        throw ('radius must greater than 1');
    }
    let rightIndex = (radius - 1) * 2;
    let _y = Combinator.spread(0, rightIndex);
    let distance = 0;
    while (true) {
        let valueY = _y.next();
        if (valueY.done) {
            break;
        }
        else {
            let _x = Combinator.spread(0 + Math.floor(distance), rightIndex - Math.floor(distance));
            while (true) {
                let valueX = _x.next();
                if (valueX.done) {
                    if (distance === 0) {
                        distance += 1;
                    }
                    else {
                        distance += 0.5;
                    }
                    break;
                }
                else {
                    yield { x: valueX.value, y: valueY.value };
                }
            }
        }
    }
};
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = Combinator;
}
//# sourceMappingURL=Combinator.js.map