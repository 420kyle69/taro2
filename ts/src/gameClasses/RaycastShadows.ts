declare var VisibilityPolygon: any;

class RaycastShadows {
	scene: GameScene;
	player: Phaser.Math.Vector2;
	graph: Phaser.GameObjects.Graphics;

	// map data
	width: number;
	height: number;
	tilewidth: number;
	tileheight: number;
	mapExtents: Phaser.Math.Vector2;
	segments: number[][][];

	// wall data
	fov: Phaser.Geom.Rectangle;

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
	}

	getWalls(): void {

		this.segments = [];

		taro.$$('wall').forEach((wall) => {

			const x = wall._translate.x - wall._bounds2d.x2;
			const y = wall._translate.y - wall._bounds2d.y2;
			const w = wall._bounds2d.x;
			const h = wall._bounds2d.y;

			this.segments.push(
				[[x, y], [x+w, y]],
				[[x, y+h], [x+w, y+h]],
				[[x, y], [x, y+h]],
				[[x+w, y], [x+w, y+h]]
			);

		});
	}

	generateFieldOfView(): void {
		// for now hard code range
		const limit = 300;
		// TODO: extract range from config

		// TODO: include map data necessary in event emission for constructor
		this.fov = Phaser.Geom.Rectangle.FromXY(
			Math.max(0, this.player.x - limit),
			Math.max(0, this.player.y - limit),
			Math.min(this.mapExtents.x, this.player.x + limit),
			Math.min(this.mapExtents.y, this.player.y + limit)
		);
	}

	moveCenter(x: number, y: number): void {
		this.player.set(x, y);
	}

	visibilityPoly(): any {

		const data = VisibilityPolygon.computeViewport([this.player.x, this.player.y], this.segments, [this.fov.left, this.fov.top], [this.fov.right, this.fov.bottom]);
		const poly: Phaser.Geom.Point[] = [];

		data.forEach((point) => {
			poly.push(new Phaser.Geom.Point(point[0], point[1]));
		});
		this.graph.fillStyle(0xFF9999, 0.5)
			.fillPoints(poly, true);
	}

	update(): void {
		this.graph.clear();
		this.generateFieldOfView();
		this.visibilityPoly();
	}
}

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = RaycastShadows;
}
