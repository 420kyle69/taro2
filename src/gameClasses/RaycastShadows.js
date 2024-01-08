var RaycastShadows = /** @class */ (function () {
    function RaycastShadows(scene) {
        this.polygons = [];
        // wall data
        this.vertices = [];
        this.allVertices = [];
        this.hEdges = [];
        this.vEdges = [];
        this.fovEdges = [];
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
        this.segments = [];
        taro.$$('wall').forEach(function (wall) {
            var x = wall._translate.x - wall._bounds2d.x2;
            var y = wall._translate.y - wall._bounds2d.y2;
            var w = wall._bounds2d.x;
            var h = wall._bounds2d.y;
            _this.vertices.push(new Phaser.Math.Vector2(x, y), new Phaser.Math.Vector2(x + w, y), new Phaser.Math.Vector2(x + w, y + h), new Phaser.Math.Vector2(x, y + h));
            _this.hEdges.push(new Phaser.Geom.Line(x, y, x + w, y), new Phaser.Geom.Line(x, y + h, x + w, y + h));
            _this.vEdges.push(new Phaser.Geom.Line(x, y, x, y + h), new Phaser.Geom.Line(x + w, y, x + w, y + h));
            _this.segments.push([[x, y], [x + w, y]], [[x, y + h], [x + w, y + h]], [[x, y], [x, y + h]], [[x + w, y], [x + w, y + h]]);
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
        // this.drawWallEdges();
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
            // scale the ray based on distance to fov limit
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
        // for now hard code range
        var limit = 300;
        // TODO: extract range from config
        // TODO: include map data necessary in event emission for constructor
        this.fov = Phaser.Geom.Rectangle.FromXY(Math.max(0, this.player.x - limit), Math.max(0, this.player.y - limit), Math.min(this.mapExtents.x, this.player.x + limit), Math.min(this.mapExtents.y, this.player.y + limit));
        var edgeVertices = [
            new Phaser.Math.Vector2(this.fov.left, this.fov.top),
            new Phaser.Math.Vector2(this.fov.right, this.fov.top),
            new Phaser.Math.Vector2(this.fov.right, this.fov.bottom),
            new Phaser.Math.Vector2(this.fov.left, this.fov.bottom)
        ];
        this.fovEdges = [];
        // edge lines of fov
        this.fovEdges = [
            this.fov.getLineA(),
            this.fov.getLineB(),
            this.fov.getLineC(),
            this.fov.getLineD() // PI >> 3PI/4 || -3PI/4 >> -PI
        ];
        var fovMinMax = {
            minX: this.fov.left,
            minY: this.fov.top,
            maxX: this.fov.right,
            maxY: this.fov.bottom
        };
        // this.graph.lineStyle(2, 0xFF3333, 1);
        // this.wallIntersections = [];
        // this.fovEdges.forEach((edge) => {
        // 	this.graph.strokeLineShape(edge);
        // 	this.edgesTree.search(this.edgesTree.toBBox(edge))
        // 		.forEach((wall) => {
        // 			const fovIntersectsWall = Phaser.Geom.Intersects.GetLineToLine(edge, wall);
        // 			if (fovIntersectsWall) {
        // 				this.wallIntersections.push(new Phaser.Math.Vector2(fovIntersectsWall.x, fovIntersectsWall.y));
        // 			}
        // 		});
        // });
        // this.allVertices = [
        // 	...edgeVertices,
        // 	...this.wallIntersections,
        // 	...this.verticesTree.search(fovMinMax)
        // ];
        // this.graph.fillStyle(0x99FF99, 0.8);
        // this.verticesTree.search(fovMinMax).forEach((x) => {
        // 	this.graph.fillCircle(x.x, x.y, 4);
        // });
        // this.getRays();
        // this.cullRays();
    };
    RaycastShadows.prototype.cullRays = function () {
        var _this = this;
        var local = [];
        var secondRound = [];
        var bo = true;
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
                var closestV2 = new Phaser.Math.Vector2(closest.x, closest.y);
                local.push(closestV2);
                if (closest.z === 1) {
                    secondRound.push(closestV2);
                    _this.graph.fillStyle(0x00FFFF, 0.8);
                    _this.graph.fillCircle(closestV2.x, closestV2.y, 4);
                }
            }
            else {
                local.push(ray.getPointB());
            }
        });
        this.graph.fillStyle(0xFF0000, 0.8);
        var rays = [];
        secondRound.forEach(function (vertex) {
            var point = Phaser.Geom.Intersects.GetLineToRectangle(Phaser.Geom.Line.Extend(new Phaser.Geom.Line(_this.player.x, _this.player.y, vertex.x, vertex.y), 0, 600), _this.fov);
            if (point[0]) {
                _this.graph.fillCircle(point[0].x, point[0].y, 4);
                rays.push(new Phaser.Geom.Line(_this.player.x, _this.player.y, point[0].x, point[0].y));
            }
        });
        rays.forEach(function (ray) {
            var hits = [];
            _this.edgesTree.search(_this.edgesTree.toBBox(ray))
                .forEach(function (edge) {
                var hit = Phaser.Geom.Intersects.GetLineToLine(ray, edge);
                if (hit) {
                    hits.push(hit);
                }
            });
            _this.graph.fillStyle(0x00FFFF, 0.8);
            if (hits.length === 2) {
                hits.forEach(function (hit) {
                    local.push(new Phaser.Math.Vector2(hit.x, hit.y));
                });
            }
            else if (hits.length > 0) {
                var closest = hits.sort(_this.sortZ)[0];
                local.push(new Phaser.Math.Vector2(closest.x, closest.y));
            }
            // hits.forEach((hit) => {
            // 	this.graph.fillCircle(hit.x, hit.y, 4);
            // });
        });
        local = this.sortClockwise(local, this.player);
        // console.log(local);
        // console.log(simplify(local));
        this.getCulledRays(local);
        this.graph.lineStyle(2, 0xFF9999, 1);
        // this.culledRays.forEach((ray) => {
        // 	this.graph.strokeLineShape(ray);
        // });
        rays.forEach(function (ray) {
            _this.graph.strokeLineShape(ray);
        });
        this.graph.fillStyle(0xFF9999, 0.5)
            .fillPoints(simplify(local), true);
    };
    RaycastShadows.prototype.scaleVectorToLimit = function (vertex) {
        return new Phaser.Math.Vector2();
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
    RaycastShadows.prototype.visibilityPoly = function () {
        var data = VisibilityPolygon.computeViewport([this.player.x, this.player.y], this.segments, [this.fov.left, this.fov.top], [this.fov.right, this.fov.bottom]);
        var poly = [];
        data.forEach(function (point) {
            poly.push(new Phaser.Geom.Point(point[0], point[1]));
        });
        this.graph.fillStyle(0xFF9999, 0.5)
            .fillPoints(poly, true);
    };
    RaycastShadows.prototype.update = function () {
        this.graph.clear();
        this.drawWalls();
        this.generateFieldOfView();
        this.visibilityPoly();
    };
    return RaycastShadows;
}());
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = RaycastShadows;
}
//# sourceMappingURL=RaycastShadows.js.map