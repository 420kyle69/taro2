var TileShape = /** @class */ (function () {
    function TileShape(size, shape) {
        if (size === void 0) { size = { x: 1, y: 1 }; }
        if (shape === void 0) { shape = 'rectangle'; }
        this.sample = {};
        this.shape = shape;
        this.size = size;
    }
    /**
     * calc the sample to print
     * @param selectedTileArea selectedTiles
     * @param size brush's size
     * @param temp if true, it won't change this.sample, but return it instead.
     * @returns sample to print
     */
    TileShape.prototype.calcSample = function (selectedTileArea, size, shape, temp) {
        if (temp === void 0) { temp = false; }
        var xArray = Object.keys(selectedTileArea);
        var yArray = Object.values(selectedTileArea).map(function (object) { return Object.keys(object); }).flat().sort(function (a, b) { return parseInt(a) - parseInt(b); });
        var minX = parseInt(xArray[0]);
        var minY = parseInt(yArray[0]);
        var maxX = parseInt(xArray[xArray.length - 1]);
        var maxY = parseInt(yArray[yArray.length - 1]);
        var xLength = maxX - minX + 1;
        var yLength = maxY - minY + 1;
        var tempSample = {};
        switch (shape || this.shape) {
            case 'rectangle': {
                tempSample = TileShape.calcRect(minX, xLength, minY, yLength, selectedTileArea, size);
                break;
            }
            case 'diamond': {
                tempSample = TileShape.calcDiamond(minX, xLength, minY, yLength, selectedTileArea, size);
                break;
            }
            case 'circle': {
                tempSample = TileShape.calcCircle(minX, xLength, minY, yLength, selectedTileArea, size);
                break;
            }
        }
        if (!temp) {
            this.sample = tempSample;
        }
        return tempSample;
    };
    TileShape.calcCircle = function (minX, xLength, minY, yLength, selectedTileArea, size) {
        var circleGenerator = Combinator.circle(Math.floor(Math.max(size.x, size.y) / 2) + 1);
        var maxLoop = Constants.MAX_LOOP;
        var newSample = {};
        while (maxLoop > 0) {
            var circleValue = circleGenerator.next();
            if (circleValue.done) {
                break;
            }
            var vec2d = circleValue.value;
            if (selectedTileArea[minX + vec2d.x % xLength] && selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength]) {
                if (!newSample[vec2d.x]) {
                    newSample[vec2d.x] = {};
                }
                newSample[vec2d.x][vec2d.y] = selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength];
            }
            maxLoop -= 1;
        }
        return newSample;
    };
    TileShape.calcDiamond = function (minX, xLength, minY, yLength, selectedTileArea, size) {
        var diamondGenerator = Combinator.diamond(Math.floor(Math.max(size.x, size.y) / 2) + 1);
        var maxLoop = Constants.MAX_LOOP;
        var newSample = {};
        while (maxLoop > 0) {
            var diamondValue = diamondGenerator.next();
            if (diamondValue.done) {
                break;
            }
            var vec2d = diamondValue.value;
            if (selectedTileArea[minX + vec2d.x % xLength] && selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength]) {
                if (!newSample[vec2d.x]) {
                    newSample[vec2d.x] = {};
                }
                newSample[vec2d.x][vec2d.y] = selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength];
            }
            maxLoop -= 1;
        }
        return newSample;
    };
    TileShape.calcRect = function (minX, xLength, minY, yLength, selectedTileArea, size) {
        var rectGenerator = Combinator.rect(size.x, size.y);
        var maxLoop = Constants.MAX_LOOP;
        var newSample = {};
        while (maxLoop > 0) {
            var rectValue = rectGenerator.next();
            if (rectValue.done) {
                break;
            }
            var vec2d = rectValue.value;
            if (selectedTileArea[minX + vec2d.x % xLength] && selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength]) {
                if (!newSample[vec2d.x]) {
                    newSample[vec2d.x] = {};
                }
                newSample[vec2d.x][vec2d.y] = selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength];
            }
            maxLoop -= 1;
        }
        return newSample;
    };
    return TileShape;
}());
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = TileShape;
}
//# sourceMappingURL=TileShape.js.map