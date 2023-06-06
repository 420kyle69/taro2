var TileShape = /** @class */ (function () {
    function TileShape(size, shape) {
        if (size === void 0) { size = { x: 1, y: 1 }; }
        if (shape === void 0) { shape = 'rectangle'; }
        this.shape = 'rectangle';
        this.size = { x: 1, y: 1 };
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
        return this.sample;
    };
    return TileShape;
}());
//# sourceMappingURL=TileShape.js.map