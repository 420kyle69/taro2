declare var RBush: any;

class RaycastShadows {
	polygons = [];
	scene: GameScene;
	player: Phaser.Math.Vector2;
	graph: Phaser.GameObjects.Graphics;

	// map data
	width: number;
	height: number;
	tilewidth: number;
	tileheight: number;
	mapExtents: Phaser.Math.Vector2;

	// wall data
	vertices: Phaser.Math.Vector2[] = [];
	allVertices: Phaser.Math.Vector2[] = [];
	hEdges: Phaser.Geom.Line[] = [];
	vEdges: Phaser.Geom.Line[] = [];
	edgesTree: any;
	verticesTree: any;
	wallIntersections: Phaser.Math.Vector3[];
	rays: Phaser.Geom.Line[];
	culledRays: Phaser.Geom.Line[];

	constructor(scene: GameScene) {
		this.scene = scene;
		this.player = Phaser.Math.Vector2.ZERO;
		this.graph = this.scene.add.graphics();

		// definitely some redundancy here
		const { width, height, tilewidth, tileheight } = taro.map.data;
		this.width = width;
		this.height = height;
		this.tilewidth = tilewidth;
		this.tileheight = tileheight;
		// vector to store the bottom right boundary of the map
		this.mapExtents = new Phaser.Math.Vector2(
			// x
			this.width * this.tilewidth,
			// y
			this.height * this.tileheight
		);
		this.getWalls();
		this.drawWalls();
	}

	getWalls(): void {

		this.graph.setDepth(41000);
		this.graph.lineStyle(3, 0x000, 1);

		taro.$$('wall').forEach((wall) => {

			const x = wall._translate.x - wall._bounds2d.x2;
			const y = wall._translate.y - wall._bounds2d.y2;
			const w = wall._bounds2d.x;
			const h = wall._bounds2d.y;
			this.vertices.push(
				new Phaser.Math.Vector2(x, y),
				new Phaser.Math.Vector2(x + w, y),
				new Phaser.Math.Vector2(x + w, y + h),
				new Phaser.Math.Vector2(x, y + h)
			);
			this.hEdges.push(
				new Phaser.Geom.Line(x, y, x + w, y),
				new Phaser.Geom.Line(x, y + h, x + w, y + h)
			);
			this.vEdges.push(
				new Phaser.Geom.Line(x, y, x, y + h),
				new Phaser.Geom.Line(x + w, y, x + w, y + h)
			);

		});

		this.edgesTree = new RBush();
		this.edgesTree.toBBox = ({
			x1,
			y1,
			x2,
			y2
		}) => ({
			// there has to be a better way...
			// solves issue where bottom and left edge weren't registering contacts
			// because min and max were reversed
			minX: Math.min(x1, x2),
			minY: Math.min(y1, y2),
			maxX: Math.max(x1, x2),
			maxY: Math.max(y1, y2)
		});
		this.edgesTree.load(this.hEdges);
		this.edgesTree.load(this.vEdges);

		// remove duplicate vertices
		this.vertices = _.uniqWith(this.vertices, _.isEqual);
		this.verticesTree = new RBush();
		this.verticesTree.toBBox = ({x , y}) => ({
			minX: x,
			minY: y,
			maxX: x,
			maxY: y
		});
		this.verticesTree.load(this.vertices);
	}

	drawWallEdges(): void {

		this.graph.lineStyle(2, 0x00FF66, 1);
		this.hEdges.forEach((edge) => {
			this.graph.strokeLineShape(edge);
		});

		this.graph.lineStyle(2, 0xFFFF99, 1);
		this.vEdges.forEach((edge) => {
			this.graph.strokeLineShape(edge);
		});
	}

	drawWallVertices(): void {

		this.graph.fillStyle(0xFF9999, 0.8);
		this.vertices.forEach((vertex) => {
			this.graph.fillCircle(vertex.x, vertex.y, 4);
		});
	}

	drawWalls(): void {
		this.drawWallEdges();
		this.drawWallVertices();
	}

	drawRays(): void {

		// draw lines from player to each vertex
		this.graph.lineStyle(2, 0x0099FF, 1);

		this.culledRays.forEach((ray) => {
			this.graph.strokeLineShape(ray);
		});
	}

	getRays(): void {
		this.rays = [];

		this.allVertices.forEach((vertex) => {
			this.rays.push(new Phaser.Geom.Line(this.player.x, this.player.y, vertex.x, vertex.y));
		});
	}

	getCulledRays(points: Phaser.Math.Vector2[]): void {
		this.culledRays = [];

		points.forEach((point) => {
			this.culledRays.push(new Phaser.Geom.Line(this.player.x, this.player.y, point.x, point.y));
		});
	}

	drawFovWallIntersections(): void {
		this.graph.fillStyle(0x9999FF, 0.8);
		this.wallIntersections.forEach((intersection) => {
			this.graph.fillCircle(intersection.x, intersection.y, 4);
		});
	}

	generateFieldOfView(): void {
		// for now hard code range
		const limit = 300;
		// TODO: extract range from config

		// TODO: include map data necessary in event emission for constructor
		const fov = Phaser.Geom.Rectangle.FromXY(
			Math.max(0, this.player.x - limit),
			Math.max(0, this.player.y - limit),
			Math.min(this.mapExtents.x, this.player.x + limit),
			Math.min(this.mapExtents.y, this.player.y + limit)
		);

		const edgeVertices = [
			new Phaser.Math.Vector2(fov.left, fov.top),
			new Phaser.Math.Vector2(fov.right, fov.top),
			new Phaser.Math.Vector2(fov.right, fov.bottom),
			new Phaser.Math.Vector2(fov.left, fov.bottom)
		];

		// edge lines of fov
		const edges = [
			fov.getLineA(),
			fov.getLineB(),
			fov.getLineC(),
			fov.getLineD()
		];

		const fovMinMax = {
			minX: fov.left,
			minY: fov.top,
			maxX: fov.right,
			maxY: fov.bottom
		};

		this.graph.lineStyle(2, 0xFF3333, 1);

		this.wallIntersections = [];

		edges.forEach((edge) => {
			this.graph.strokeLineShape(edge);

			this.edgesTree.search(this.edgesTree.toBBox(edge))
				.forEach((wall) => {

					const fovIntersectsWall = Phaser.Geom.Intersects.GetLineToLine(edge, wall);
					if (fovIntersectsWall) {
						this.wallIntersections.push(fovIntersectsWall);
					}
				});
		});

		this.allVertices = [
			...edgeVertices,
			...this.wallIntersections,
			...this.verticesTree.search(fovMinMax)
		];

		this.graph.fillStyle(0x99FF99, 0.8);
		this.verticesTree.search(fovMinMax).forEach((x) => {
			this.graph.fillCircle(x.x, x.y, 4);
		});

		this.getRays();
		this.cullRays();
	}

	cullRays(): void {
		let local: Phaser.Math.Vector2[] = [];

		this.rays.forEach((ray) => {
			const hits: Phaser.Math.Vector3[] = [];

			this.edgesTree.search(this.edgesTree.toBBox(ray))
				.forEach((edge) => {
					const hit = Phaser.Geom.Intersects.GetLineToLine(ray, edge);

					if (hit) {
						hits.push(hit);
					}
				});

			if (hits.length > 0) {
				const closest = hits.sort(this.sortZ)[0];
				local.push(new Phaser.Math.Vector2(closest.x, closest.y));
			} else {
				local.push(ray.getPointB());
			}
		});

		
		local = this.sortClockwise(local, this.player);
		this.getCulledRays(local);

		this.culledRays.forEach((ray) => {
			this.graph.strokeLineShape(ray);
		});

		this.graph.fillStyle(0xFF9999, 0.5)
			.fillPoints(local, true);
	}

	sortZ(a: Phaser.Math.Vector3, b: Phaser.Math.Vector3): number {
		return a.z - b.z;
	}

	sortClockwise(points: Phaser.Math.Vector2[], center: Phaser.Math.Vector2): Phaser.Math.Vector2[] {
		// Adapted from <https://stackoverflow.com/a/6989383/822138> (ciamej)
		var cx = center.x;
		var cy = center.y;

		var sort = function (a: Phaser.Math.Vector2, b: Phaser.Math.Vector2) {
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
	}

	moveCenter(x: number, y: number): void {
		this.player.set(x, y);
	}

	update(): void {
		this.graph.clear();
		this.drawWalls();
		this.generateFieldOfView();
		this.drawFovWallIntersections();
	}
}

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = RaycastShadows;
}
