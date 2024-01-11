var VisibilityMask = /** @class */ (function () {
    function VisibilityMask(scene) {
        console.time('CONSTRUCTOR');
        this.scene = scene;
        this.player = Phaser.Math.Vector2.ZERO;
        this.graph = this.scene.add.graphics();
        // definitely some redundancy here
        var _a = taro.map.data, width = _a.width, height = _a.height, tilewidth = _a.tilewidth, tileheight = _a.tileheight;
        this.width = width;
        this.height = height;
        this.tilewidth = tilewidth;
        this.tileheight = tileheight;
        // vector to store the bottom right boundary of the map
        this.mapExtents = new Phaser.Math.Vector2(
        // x
        this.width * this.tilewidth, 
        // y
        this.height * this.tileheight);
        this.getWalls();
        this.mask = new Phaser.Display.Masks.GeometryMask(scene, this.graph);
        console.timeEnd('CONSTRUCTOR');
    }
    VisibilityMask.prototype.unMaskWalls = function () {
        var _this = this;
        this.walls.forEach(function (wall) {
            _this.graph.fillRectShape(wall);
        });
    };
    VisibilityMask.prototype.getWalls = function () {
        var _this = this;
        console.time('GET WALLS');
        this.segments = [];
        this.walls = [];
        taro.$$('wall').forEach(function (wall) {
            var x = wall._translate.x - wall._bounds2d.x2;
            var y = wall._translate.y - wall._bounds2d.y2;
            var w = wall._bounds2d.x;
            var h = wall._bounds2d.y;
            _this.walls.push(Phaser.Geom.Rectangle.FromXY(x, y, x + w, y + h));
            _this.segments.push([[x, y], [x + w, y]], [[x, y + h], [x + w, y + h]], [[x, y], [x, y + h]], [[x + w, y], [x + w, y + h]]);
        });
        console.timeEnd('GET WALLS');
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
        // console.timeEnd('VISIBILITY POLYGON');
        this.scene.cameras.main.setMask(this.mask, false);
    };
    VisibilityMask.prototype.destroyVisibilityMask = function () {
        this.graph.clear();
        delete this.mask;
        delete this.graph;
    };
    VisibilityMask.prototype.update = function () {
        this.graph.clear();
        this.generateFieldOfView(this.range);
        this.visibilityPoly();
    };
    return VisibilityMask;
}());
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = VisibilityMask;
}
//# sourceMappingURL=VisibilityMask.js.map