var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var RaycastShadows = /** @class */ (function () {
    function RaycastShadows(scene) {
        this.polygons = [];
        // wall data
        this.vertices = [];
        this.allVertices = [];
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
        this.getWalls();
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
        this.edgesTree = new RBush();
        this.edgesTree.toBBox = function (_a) {
            var x1 = _a.x1, y1 = _a.y1, x2 = _a.x2, y2 = _a.y2;
            return ({
                // there has to be a better way...
                // solves issue where bottom and left edge weren't registering contacts
                // because min and max were reversed
                minX: Math.min(x1, x2),
                minY: Math.min(y1, y2),
                maxX: Math.max(x1, x2),
                maxY: Math.max(y1, y2)
            });
        };
        this.edgesTree.load(this.hEdges);
        this.edgesTree.load(this.vEdges);
        // remove duplicate vertices
        this.vertices = _.uniqWith(this.vertices, _.isEqual);
        this.verticesTree = new RBush();
        this.verticesTree.toBBox = function (_a) {
            var x = _a.x, y = _a.y;
            return ({
                minX: x,
                minY: y,
                maxX: x,
                maxY: y
            });
        };
        this.verticesTree.load(this.vertices);
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
    RaycastShadows.prototype.drawRays = function () {
        var _this = this;
        // draw lines from player to each vertex
        this.graph.lineStyle(2, 0x0099FF, 1);
        this.culledRays.forEach(function (ray) {
            _this.graph.strokeLineShape(ray);
        });
    };
    RaycastShadows.prototype.getRays = function () {
        var _this = this;
        this.rays = [];
        this.allVertices.forEach(function (vertex) {
            _this.rays.push(new Phaser.Geom.Line(_this.player.x, _this.player.y, vertex.x, vertex.y));
        });
    };
    RaycastShadows.prototype.getCulledRays = function (points) {
        var _this = this;
        this.culledRays = [];
        points.forEach(function (point) {
            _this.culledRays.push(new Phaser.Geom.Line(_this.player.x, _this.player.y, point.x, point.y));
        });
    };
    RaycastShadows.prototype.drawFovWallIntersections = function () {
        var _this = this;
        this.graph.fillStyle(0x9999FF, 0.8);
        this.wallIntersections.forEach(function (intersection) {
            _this.graph.fillCircle(intersection.x, intersection.y, 4);
        });
    };
    RaycastShadows.prototype.generateFieldOfView = function () {
        var _this = this;
        // for now hard code range
        var limit = 300;
        // TODO: extract range from config
        // TODO: include map data necessary in event emission for constructor
        var fov = Phaser.Geom.Rectangle.FromXY(Math.max(0, this.player.x - limit), Math.max(0, this.player.y - limit), Math.min(this.mapExtents.x, this.player.x + limit), Math.min(this.mapExtents.y, this.player.y + limit));
        var edgeVertices = [
            new Phaser.Math.Vector2(fov.left, fov.top),
            new Phaser.Math.Vector2(fov.right, fov.top),
            new Phaser.Math.Vector2(fov.right, fov.bottom),
            new Phaser.Math.Vector2(fov.left, fov.bottom)
        ];
        // edge lines of fov
        var edges = [
            fov.getLineA(),
            fov.getLineB(),
            fov.getLineC(),
            fov.getLineD()
        ];
        var fovMinMax = {
            minX: fov.left,
            minY: fov.top,
            maxX: fov.right,
            maxY: fov.bottom
        };
        this.graph.lineStyle(2, 0xFF3333, 1);
        this.wallIntersections = [];
        edges.forEach(function (edge) {
            _this.graph.strokeLineShape(edge);
            _this.edgesTree.search(_this.edgesTree.toBBox(edge))
                .forEach(function (wall) {
                var fovIntersectsWall = Phaser.Geom.Intersects.GetLineToLine(edge, wall);
                if (fovIntersectsWall) {
                    _this.wallIntersections.push(fovIntersectsWall);
                }
            });
        });
        this.allVertices = __spreadArray(__spreadArray(__spreadArray([], edgeVertices, true), this.wallIntersections, true), this.verticesTree.search(fovMinMax), true);
        this.graph.fillStyle(0x99FF99, 0.8);
        this.verticesTree.search(fovMinMax).forEach(function (x) {
            _this.graph.fillCircle(x.x, x.y, 4);
        });
        this.getRays();
        this.cullRays();
    };
    RaycastShadows.prototype.cullRays = function () {
        var _this = this;
        var local = [];
        this.rays.forEach(function (ray) {
            var hits = [];
            _this.edgesTree.search(_this.edgesTree.toBBox(ray))
                .forEach(function (edge) {
                var hit = Phaser.Geom.Intersects.GetLineToLine(ray, edge);
                if (hit) {
                    hits.push(hit);
                }
            });
            if (hits.length > 0) {
                var closest = hits.sort(_this.sortZ)[0];
                local.push(new Phaser.Math.Vector2(closest.x, closest.y));
            }
            else {
                local.push(ray.getPointB());
            }
        });
        local = this.sortClockwise(local, this.player);
        this.getCulledRays(local);
        this.culledRays.forEach(function (ray) {
            _this.graph.strokeLineShape(ray);
        });
        this.graph.fillStyle(0xFF9999, 0.5)
            .fillPoints(local, true);
    };
    RaycastShadows.prototype.sortZ = function (a, b) {
        return a.z - b.z;
    };
    RaycastShadows.prototype.sortClockwise = function (points, center) {
        // Adapted from <https://stackoverflow.com/a/6989383/822138> (ciamej)
        var cx = center.x;
        var cy = center.y;
        var sort = function (a, b) {
            if (a.x - cx >= 0 && b.x - cx < 0) {
                return -1;
            }
            if (a.x - cx < 0 && b.x - cx >= 0) {
                return 1;
            }
            if (a.x - cx === 0 && b.x - cx === 0) {
                if (a.y - cy >= 0 || b.y - cy >= 0) {
                    return a.y > b.y ? 1 : -1;
                }
                return b.y > a.y ? 1 : -1;
            }
            // Compute the cross product of vectors (center -> a) * (center -> b)
            var det = (a.x - cx) * -(b.y - cy) - (b.x - cx) * -(a.y - cy);
            if (det < 0) {
                return -1;
            }
            if (det > 0) {
                return 1;
            }
            /*
             * Points a and b are on the same line from the center
             * Check which point is closer to the center
             */
            var d1 = (a.x - cx) * (a.x - cx) + (a.y - cy) * (a.y - cy);
            var d2 = (b.x - cx) * (b.x - cx) + (b.y - cy) * (b.y - cy);
            return d1 > d2 ? -1 : 1;
        };
        return points.sort(sort);
    };
    RaycastShadows.prototype.moveCenter = function (x, y) {
        this.player.set(x, y);
    };
    RaycastShadows.prototype.update = function () {
        this.graph.clear();
        this.drawWalls();
        this.generateFieldOfView();
        this.drawFovWallIntersections();
    };
    return RaycastShadows;
}());
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = RaycastShadows;
}
//# sourceMappingURL=RaycastShadows.js.map