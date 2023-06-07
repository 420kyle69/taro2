var TileShape = /** @class */ (function () {
    function TileShape(size, shape) {
        if (size === void 0) { size = { x: 1, y: 1 }; }
        if (shape === void 0) { shape = 'circle'; }
        this.sample = {};
        this.shape = shape;
        this.size = size;
    }
    TileShape.prototype.calcSample = function (selectedTileArea, size) {
        var xArray = Object.keys(selectedTileArea);
        var yArray = Object.values(selectedTileArea).map(function (object) { return Object.keys(object); }).flat().sort(function (a, b) { return parseInt(a) - parseInt(b); });
        var minX = parseInt(xArray[0]);
        var minY = parseInt(yArray[0]);
        var maxX = parseInt(xArray[xArray.length - 1]);
        var maxY = parseInt(yArray[yArray.length - 1]);
        var xLength = maxX - minX + 1;
        var yLength = maxY - minY + 1;
        this.sample = {};
        switch (this.shape) {
            case 'rectangle': {
                this.calcRect(minX, xLength, minY, yLength, selectedTileArea, size);
                break;
            }
            case 'diamond': {
                this.calcDiamond(minX, xLength, minY, yLength, selectedTileArea, size);
                break;
            }
            case 'circle': {
                this.calcCircle(minX, xLength, minY, yLength, selectedTileArea, size);
                break;
            }
        }
        return this.sample;
    };
    TileShape.prototype.calcCircle = function (minX, xLength, minY, yLength, selectedTileArea, size) {
        var circleGenerator = circle(Math.floor(Math.max(size.x, size.y) / 2) + 1);
        var maxLoop = MAX_LOOP;
        while (maxLoop > 0) {
            var circleValue = circleGenerator.next();
            if (circleValue.done) {
                break;
            }
            var vec2d = circleValue.value;
            if (selectedTileArea[minX + vec2d.x % xLength] && selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength]) {
                if (!this.sample[vec2d.x]) {
                    this.sample[vec2d.x] = {};
                }
                this.sample[vec2d.x][vec2d.y] = selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength];
            }
            console.log(vec2d);
            maxLoop -= 1;
        }
    };
    TileShape.prototype.calcDiamond = function (minX, xLength, minY, yLength, selectedTileArea, size) {
        var diamondGenerator = diamond(Math.floor(Math.max(size.x, size.y) / 2) + 1);
        var maxLoop = MAX_LOOP;
        while (maxLoop > 0) {
            var diamondValue = diamondGenerator.next();
            if (diamondValue.done) {
                break;
            }
            var vec2d = diamondValue.value;
            if (selectedTileArea[minX + vec2d.x % xLength] && selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength]) {
                if (!this.sample[vec2d.x]) {
                    this.sample[vec2d.x] = {};
                }
                this.sample[vec2d.x][vec2d.y] = selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength];
            }
            console.log(vec2d);
            maxLoop -= 1;
        }
    };
    TileShape.prototype.calcRect = function (minX, xLength, minY, yLength, selectedTileArea, size) {
        for (var i = 0; i < size.x; i++) {
            if (!this.sample[i]) {
                this.sample[i] = {};
            }
            for (var j = 0; j < size.y; j++) {
                if (selectedTileArea[minX + i % xLength] && selectedTileArea[minX + i % xLength][minY + j % yLength]) {
                    this.sample[i][j] = selectedTileArea[minX + i % xLength][minY + j % yLength];
                }
            }
        }
    };
    return TileShape;
}());
//# sourceMappingURL=TileShape.js.map