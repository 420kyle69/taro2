var RaycastShadows = /** @class */ (function () {
    function RaycastShadows(scene) {
        this.polygons = [];
        this.scene = scene;
    }
    RaycastShadows.prototype.getWalls = function () {
        console.warn('CALLING RAYCASTSHADOWS.GETWALLS()\n');
        var graph = this.scene.add.graphics();
        graph.setDepth(41000);
        graph.lineStyle(3, 0x000, 1);
        var vertices = [];
        var hEdges = [];
        var vEdges = [];
        taro.$$('wall').forEach(function (wall) {
            var x = wall._translate.x - wall._bounds2d.x2;
            var y = wall._translate.y - wall._bounds2d.y2;
            var w = wall._bounds2d.x;
            var h = wall._bounds2d.y;
            vertices.push(new Phaser.Math.Vector2(x, y), new Phaser.Math.Vector2(x + w, y), new Phaser.Math.Vector2(x + w, y + h), new Phaser.Math.Vector2(x, y + h));
            hEdges.push(new Phaser.Geom.Line(x, y, x + w, y), new Phaser.Geom.Line(x, y + h, x + w, y + h));
            vEdges.push(new Phaser.Geom.Line(x, y, x, y + h), new Phaser.Geom.Line(x + w, y, x + w, y + h));
        });
        graph.lineStyle(2, 0x00FF66, 1);
        hEdges.forEach(function (e) {
            graph.lineBetween(e[0][0], e[1], e[0][1], e[1]);
        });
        graph.lineStyle(2, 0xFFFF99, 1);
        vEdges.forEach(function (e) {
            graph.lineBetween(e[1], e[0][0], e[1], e[0][1]);
        });
        vertices = _.uniqWith(vertices, _.isEqual);
        graph.fillStyle(0xFF9999, 0.8);
        vertices.forEach(function (v) {
            graph.fillCircle(v[0], v[1], 4);
        });
        // arbitrary static player position
        var play = { x: 300, y: 300 };
        // draw lines from player to each vertex
        graph.lineStyle(2, 0x0099FF, 1);
        var v;
        for (var _i = 0, vertices_1 = vertices; _i < vertices_1.length; _i++) {
            v = vertices_1[_i];
            graph.lineBetween(play.x, play.y, v[0], v[1]);
        }
    };
    RaycastShadows.prototype.createFieldOfView = function () {
        // for now hard code range
        // TODO: extract range from config
        var fov = Phaser.Geom.Rectangle.FromXY(Math.max(0, player.x - LIMIT), Math.max(0, player.y - LIMIT), Math.min(MAPWIDTH, player.x + LIMIT), Math.min(MAPHEIGHT, player.y + LIMIT));
    };
    return RaycastShadows;
}());
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = RaycastShadows;
}
//# sourceMappingURL=RaycastShadows.js.map