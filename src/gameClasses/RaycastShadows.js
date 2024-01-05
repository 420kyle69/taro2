var RaycastShadows = /** @class */ (function () {
    function RaycastShadows(scene) {
        this.polygons = [];
        // wall data
        this.vertices = [];
        this.hEdges = [];
        this.vEdges = [];
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
        this.drawWalls();
    }
    RaycastShadows.prototype.getWalls = function () {
        var _this = this;
        this.graph.setDepth(41000);
        this.graph.lineStyle(3, 0x000, 1);
        taro.$$('wall').forEach(function (wall) {
            var x = wall._translate.x - wall._bounds2d.x2;
            var y = wall._translate.y - wall._bounds2d.y2;
            var w = wall._bounds2d.x;
            var h = wall._bounds2d.y;
            _this.vertices.push(new Phaser.Math.Vector2(x, y), new Phaser.Math.Vector2(x + w, y), new Phaser.Math.Vector2(x + w, y + h), new Phaser.Math.Vector2(x, y + h));
            _this.hEdges.push(new Phaser.Geom.Line(x, y, x + w, y), new Phaser.Geom.Line(x, y + h, x + w, y + h));
            _this.vEdges.push(new Phaser.Geom.Line(x, y, x, y + h), new Phaser.Geom.Line(x + w, y, x + w, y + h));
        });
        // remove duplicate vertices
        this.vertices = _.uniqWith(this.vertices, _.isEqual);
    };
    RaycastShadows.prototype.drawWallEdges = function () {
        var _this = this;
        this.graph.lineStyle(2, 0x00FF66, 1);
        this.hEdges.forEach(function (edge) {
            _this.graph.strokeLineShape(edge);
        });
        this.graph.lineStyle(2, 0xFFFF99, 1);
        this.vEdges.forEach(function (edge) {
            _this.graph.strokeLineShape(edge);
        });
    };
    RaycastShadows.prototype.drawWallVertices = function () {
        var _this = this;
        this.graph.fillStyle(0xFF9999, 0.8);
        this.vertices.forEach(function (vertex) {
            _this.graph.fillCircle(vertex.x, vertex.y, 4);
        });
    };
    RaycastShadows.prototype.drawWalls = function () {
        this.drawWallEdges();
        this.drawWallVertices();
    };
    RaycastShadows.prototype.drawLinesToVertices = function () {
        var _this = this;
        // draw lines from player to each vertex
        this.graph.lineStyle(2, 0x0099FF, 1);
        this.vertices.forEach(function (vertex) {
            _this.graph.lineBetween(_this.player.x, _this.player.y, vertex.x, vertex.y);
        });
    };
    RaycastShadows.prototype.generateFieldOfView = function () {
        var _this = this;
        // for now hard code range
        var limit = 300;
        // TODO: extract range from config
        // TODO: include map data necessary in event emission for constructor
        var fov = Phaser.Geom.Rectangle.FromXY(Math.max(0, this.player.x - limit), Math.max(0, this.player.y - limit), Math.min(this.mapExtents.x, this.player.x + limit), Math.min(this.mapExtents.y, this.player.y + limit));
        // edge lines of fov
        var edges = [
            fov.getLineA(),
            fov.getLineB(),
            fov.getLineC(),
            fov.getLineD()
        ];
        this.graph.lineStyle(2, 0xFF3333, 1);
        edges.forEach(function (edge) {
            _this.graph.strokeLineShape(edge);
        });
    };
    RaycastShadows.prototype.moveCenter = function (x, y) {
        this.player.set(x, y);
    };
    RaycastShadows.prototype.update = function () {
        this.graph.clear();
        this.generateFieldOfView();
        this.drawLinesToVertices();
    };
    return RaycastShadows;
}());
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = RaycastShadows;
}
//# sourceMappingURL=RaycastShadows.js.map