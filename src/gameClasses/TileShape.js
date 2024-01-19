class TileShape {
    constructor(size = { x: 1, y: 1 }, shape = 'rectangle') {
        this.sample = {};
        this.shape = shape;
        this.size = size;
    }
    /**
     * calc the sample to print
     * @param selectedTileArea selectedTiles
     * @param size brush's size
     * @param temp if true, it won't change this.sample, but only return it instead.
     * @returns sample to print
     */
    calcSample(selectedTileArea, size, shape, temp = false) {
        const xArray = Object.keys(selectedTileArea);
        const yArray = Object.values(selectedTileArea).map((object) => Object.keys(object)).flat().sort((a, b) => parseInt(a) - parseInt(b));
        const minX = parseInt(xArray[0]);
        const minY = parseInt(yArray[0]);
        const maxX = parseInt(xArray[xArray.length - 1]);
        const maxY = parseInt(yArray[yArray.length - 1]);
        const xLength = maxX - minX + 1;
        const yLength = maxY - minY + 1;
        let tempSample = {};
        if (size === 'fitContent') {
            size = {
                x: xLength,
                y: yLength
            };
        }
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
        return { sample: tempSample, xLength, yLength, minX, minY };
    }
    static calcCircle(minX, xLength, minY, yLength, selectedTileArea, size) {
        const circleGenerator = Combinator.circle(Math.floor(Math.max(size.x, size.y) / 2) + 1);
        let maxLoop = Constants.MAX_LOOP;
        const newSample = {};
        while (maxLoop > 0) {
            const circleValue = circleGenerator.next();
            if (circleValue.done) {
                break;
            }
            const vec2d = circleValue.value;
            if (selectedTileArea[minX + vec2d.x % xLength] && selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength] !== undefined) {
                if (!newSample[vec2d.x]) {
                    newSample[vec2d.x] = {};
                }
                newSample[vec2d.x][vec2d.y] = selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength];
            }
            maxLoop -= 1;
        }
        return newSample;
    }
    static calcDiamond(minX, xLength, minY, yLength, selectedTileArea, size) {
        const diamondGenerator = Combinator.diamond(Math.floor(Math.max(size.x, size.y) / 2) + 1);
        let maxLoop = Constants.MAX_LOOP;
        const newSample = {};
        while (maxLoop > 0) {
            const diamondValue = diamondGenerator.next();
            if (diamondValue.done) {
                break;
            }
            const vec2d = diamondValue.value;
            if (selectedTileArea[minX + vec2d.x % xLength] && selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength] !== undefined) {
                if (!newSample[vec2d.x]) {
                    newSample[vec2d.x] = {};
                }
                newSample[vec2d.x][vec2d.y] = selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength];
            }
            maxLoop -= 1;
        }
        return newSample;
    }
    static calcRect(minX, xLength, minY, yLength, selectedTileArea, size) {
        const rectGenerator = Combinator.rect(size.x, size.y);
        let maxLoop = Constants.MAX_LOOP;
        const newSample = {};
        while (maxLoop > 0) {
            const rectValue = rectGenerator.next();
            if (rectValue.done) {
                break;
            }
            const vec2d = rectValue.value;
            if (selectedTileArea[minX + vec2d.x % xLength] && selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength] !== undefined) {
                if (!newSample[vec2d.x]) {
                    newSample[vec2d.x] = {};
                }
                newSample[vec2d.x][vec2d.y] = selectedTileArea[minX + vec2d.x % xLength][minY + vec2d.y % yLength];
            }
            maxLoop -= 1;
        }
        return newSample;
    }
}
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = TileShape;
}
//# sourceMappingURL=TileShape.js.map