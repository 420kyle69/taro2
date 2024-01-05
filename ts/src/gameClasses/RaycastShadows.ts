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
	hEdges: Phaser.Geom.Line[] = [];
	vEdges: Phaser.Geom.Line[] = [];

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

		// remove duplicate vertices
		this.vertices = _.uniqWith(this.vertices, _.isEqual);
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

	drawLinesToVertices(): void {

		// draw lines from player to each vertex
		this.graph.lineStyle(2, 0x0099FF, 1);

		this.vertices.forEach((vertex) => {
			this.graph.lineBetween(this.player.x, this.player.y, vertex.x, vertex.y);
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

		// edge lines of fov
		const edges = [
			fov.getLineA(),
			fov.getLineB(),
			fov.getLineC(),
			fov.getLineD()
		];

		this.graph.lineStyle(2, 0xFF3333, 1);

		edges.forEach((edge) => {
			this.graph.strokeLineShape(edge);
		});

	}

	moveCenter(x: number, y: number): void {
		this.player.set(x, y);
	}

	update(): void {
		this.graph.clear();
		this.generateFieldOfView();
		this.drawLinesToVertices();
	}
}

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = RaycastShadows;
}
