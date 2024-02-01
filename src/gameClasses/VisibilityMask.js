var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var VisibilityMask = /** @class */ (function () {
    function VisibilityMask(scene) {
        var _this = this;
        this.wallsDirty = false;
        this.unitsDirty = false;
        // console.time('CONSTRUCTOR');
        this.scene = scene;
        this.player = Phaser.Math.Vector2.ZERO;
        this.graph = this.scene.add.graphics();
        // definitely some redundancy here
        var _a = taro.game.data.map, width = _a.width, height = _a.height;
        var _b = taro.scaleMapDetails, tileWidth = _b.tileWidth, tileHeight = _b.tileHeight;
        this.width = width;
        this.height = height;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        // vector to store the bottom right boundary of the map
        this.mapExtents = new Phaser.Math.Vector2(
        // x
        this.width * this.tileWidth, 
        // y
        this.height * this.tileHeight);
        this.getWalls();
        this.getUnits();
        this.mask = new Phaser.Display.Masks.GeometryMask(scene, this.graph);
        taro.client.on('update-walls', function () {
            _this.getWalls();
        });
        taro.client.on('update-static-units', function () {
            _this.getUnits();
        });
        // console.timeEnd('CONSTRUCTOR');
    }
    VisibilityMask.prototype.unMaskWalls = function () {
        var _this = this;
        this.walls.forEach(function (wall) {
            _this.graph.fillRectShape(wall);
        });
    };
    VisibilityMask.prototype.getWalls = function () {
        var _this = this;
        // console.time('GET WALLS');
        this.wallSegments = [];
        this.walls = [];
        taro.$$('wall').forEach(function (wall) {
            _this.mapFromTaroRect(wall, _this.walls, _this.wallSegments);
        });
        this.wallsDirty = true;
        // console.timeEnd('GET WALLS');
    };
    VisibilityMask.prototype.getUnits = function () {
        var _this = this;
        this.unitSegments = [];
        this.units = [];
        this.unitsPoly = [];
        taro.$$('unit').forEach(function (unit) {
            if (unit._stats.currentBody.type !== 'static') {
                return;
            }
            var shape = unit._stats.currentBody.fixtures[0].shape.type;
            if (shape === 'rectangle') {
                _this.mapFromTaroRect(unit, _this.units, _this.unitSegments);
            }
            else if (shape === 'circle') {
                _this.mapFromTaroCircle(unit, _this.unitsPoly, _this.unitSegments, 12);
            }
        });
        this.unitsDirty = true;
    };
    VisibilityMask.prototype.mapFromTaroRect = function (entity, rectArray, segArray) {
        var x = entity._translate.x - entity._bounds2d.x2;
        var y = entity._translate.y - entity._bounds2d.y2;
        var w = entity._bounds2d.x;
        var h = entity._bounds2d.y;
        rectArray.push(Phaser.Geom.Rectangle.FromXY(x, y, x + w, y + h));
        segArray.push([[x, y], [x + w, y]], [[x, y + h], [x + w, y + h]], [[x, y], [x, y + h]], [[x + w, y], [x + w, y + h]]);
    };
    VisibilityMask.prototype.mapFromTaroCircle = function (entity, polygonArray, segArray, sides) {
        var r = entity._bounds2d.x2 * (1 + 1 / sides); // x + x*sides^-1 = x * (1 + 1/sides)
        var x = entity._translate.x;
        var y = entity._translate.y;
        var points = Phaser.Geom.Circle.GetPoints(new Phaser.Geom.Circle(x, y, r), sides);
        polygonArray.push(new Phaser.Geom.Polygon(points));
        var i = 0;
        while (i < sides) {
            if (i + 1 !== sides) {
                segArray.push([[points[i].x, points[i].y], [points[i + 1].x, points[i + 1].y]]);
            }
            segArray.push([[points[i].x, points[i].y], [points[0].x, points[0].y]]);
            i++;
        }
    };
    VisibilityMask.prototype.rebuildSegments = function () {
        if (this.wallsDirty || this.unitsDirty) {
            this.segments = __spreadArray(__spreadArray([], this.unitSegments, true), this.wallSegments, true);
            this.wallsDirty = false;
            this.unitsDirty = false;
        }
    };
    VisibilityMask.prototype.generateFieldOfView = function (range) {
        this.range = range;
        // TODO: include map data necessary in event emission for constructor
        this.fov = Phaser.Geom.Rectangle.FromXY(Math.max(0, this.player.x - range), Math.max(0, this.player.y - range), Math.min(this.mapExtents.x, this.player.x + range), Math.min(this.mapExtents.y, this.player.y + range));
    };
    VisibilityMask.prototype.moveCenter = function (x, y) {
        this.player.set(x, y);
    };
    VisibilityMask.prototype.visibilityPoly = function () {
        var _this = this;
        // console.time('VISIBILITY POLYGON');
        var data = VisibilityPolygon.computeViewport([this.player.x, this.player.y], this.segments, [this.fov.left, this.fov.top], [this.fov.right, this.fov.bottom]);
        var poly = [];
        data.forEach(function (point) {
            poly.push(new Phaser.Geom.Point(point[0], point[1]));
        });
        this.graph.fillStyle(0xFF9999, 0)
            .fillPoints(poly, true);
        // if include walls
        this.walls.forEach(function (wall) {
            _this.graph.fillRectShape(wall);
        });
        // if include (static) units
        this.units.forEach(function (unit) {
            _this.graph.fillRectShape(unit);
        });
        // if include (static) units > circles
        this.unitsPoly.forEach(function (unit) {
            _this.graph.fillPoints(unit.points); // TODO: these can really just be circles
        });
        // console.timeEnd('VISIBILITY POLYGON');
        this.scene.cameras.main.setMask(this.mask, false);
    };
    VisibilityMask.prototype.destroyVisibilityMask = function () {
        this.scene.cameras.main.clearMask(true);
        this.graph.clear();
    };
    VisibilityMask.prototype.update = function () {
        this.graph.clear();
        this.generateFieldOfView(this.range);
        this.rebuildSegments();
        this.visibilityPoly();
    };
    return VisibilityMask;
}());
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = VisibilityMask;
}
//# sourceMappingURL=VisibilityMask.js.map