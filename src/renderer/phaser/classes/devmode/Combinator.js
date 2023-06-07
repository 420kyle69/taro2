var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var increase = function (start, end, step) {
    if (step === void 0) { step = 1; }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(start <= end)) return [3 /*break*/, 2];
                return [4 /*yield*/, start];
            case 1:
                _a.sent();
                start += step;
                return [3 /*break*/, 0];
            case 2: return [2 /*return*/];
        }
    });
};
var decrease = function (start, end, step) {
    if (step === void 0) { step = 1; }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(start >= end)) return [3 /*break*/, 2];
                return [4 /*yield*/, start];
            case 1:
                _a.sent();
                start -= step;
                return [3 /*break*/, 0];
            case 2: return [2 /*return*/];
        }
    });
};
var range = function (start, end, step) {
    if (step === void 0) { step = 1; }
    if (start < end) {
        return increase(start, end, Math.abs(step));
    }
    else {
        return decrease(start, end, Math.abs(step));
    }
};
var toggle = function (a, b) {
    var valueA, valueB;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!true) return [3 /*break*/, 5];
                valueA = a.next();
                valueB = b.next();
                if (valueA.done && valueB.done) {
                    return [3 /*break*/, 5];
                }
                if (!!valueA.done) return [3 /*break*/, 2];
                return [4 /*yield*/, valueA.value];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                if (!!valueB.done) return [3 /*break*/, 4];
                return [4 /*yield*/, valueB.value];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [3 /*break*/, 0];
            case 5: return [2 /*return*/];
        }
    });
};
var equal = function (start) {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, start];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
};
var spread = function (start, end, step) {
    if (step === void 0) { step = 1; }
    if (start === end) {
        return equal(start);
    }
    var middle = Math.floor((end + start) / 2);
    return toggle(range(middle, start, step), range(middle + step, end, step));
};
var rect = function (x, y) {
    var _x, valueX, _y, valueY;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _x = range(0, x - 1);
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 8];
                valueX = _x.next();
                if (!valueX.done) return [3 /*break*/, 2];
                return [3 /*break*/, 8];
            case 2:
                _y = range(0, y - 1);
                _a.label = 3;
            case 3:
                if (!true) return [3 /*break*/, 7];
                valueY = _y.next();
                if (!valueY.done) return [3 /*break*/, 4];
                return [3 /*break*/, 7];
            case 4: return [4 /*yield*/, { x: valueX.value, y: valueY.value }];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [3 /*break*/, 3];
            case 7: return [3 /*break*/, 1];
            case 8: return [2 /*return*/];
        }
    });
};
var circle = function (radius) {
    var rightIndex, _y, distance, valueY, chord, _x, valueX;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (radius < 1) {
                    throw ('radius must greater than 1');
                }
                rightIndex = (radius - 1) * 2;
                _y = spread(0, rightIndex);
                distance = 0;
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 8];
                valueY = _y.next();
                if (!valueY.done) return [3 /*break*/, 2];
                return [3 /*break*/, 8];
            case 2:
                chord = Math.ceil(Math.sqrt(Math.pow(radius, 2) - Math.pow(Math.floor(distance), 2)) - 0.1);
                _x = spread(0 + radius - chord, rightIndex - radius + chord);
                _a.label = 3;
            case 3:
                if (!true) return [3 /*break*/, 7];
                valueX = _x.next();
                if (!valueX.done) return [3 /*break*/, 4];
                if (distance === 0) {
                    distance += 1;
                }
                else {
                    distance += 0.5;
                }
                return [3 /*break*/, 7];
            case 4: return [4 /*yield*/, { x: valueX.value, y: valueY.value }];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [3 /*break*/, 3];
            case 7: return [3 /*break*/, 1];
            case 8: return [2 /*return*/];
        }
    });
};
var diamond = function (radius) {
    var rightIndex, _y, distance, valueY, _x, valueX;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (radius < 1) {
                    throw ('radius must greater than 1');
                }
                rightIndex = (radius - 1) * 2;
                _y = spread(0, rightIndex);
                distance = 0;
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 8];
                valueY = _y.next();
                if (!valueY.done) return [3 /*break*/, 2];
                return [3 /*break*/, 8];
            case 2:
                _x = spread(0 + Math.floor(distance), rightIndex - Math.floor(distance));
                _a.label = 3;
            case 3:
                if (!true) return [3 /*break*/, 7];
                valueX = _x.next();
                if (!valueX.done) return [3 /*break*/, 4];
                if (distance === 0) {
                    distance += 1;
                }
                else {
                    distance += 0.5;
                }
                return [3 /*break*/, 7];
            case 4: return [4 /*yield*/, { x: valueX.value, y: valueY.value }];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [3 /*break*/, 3];
            case 7: return [3 /*break*/, 1];
            case 8: return [2 /*return*/];
        }
    });
};
//# sourceMappingURL=Combinator.js.map