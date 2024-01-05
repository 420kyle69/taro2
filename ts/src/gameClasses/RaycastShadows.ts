class RaycastShadows {
	polygons = [];
	scene: GameScene;
	constructor(scene: GameScene) {
		this.scene = scene;
	}

	getWalls(): void {
		console.warn('CALLING RAYCASTSHADOWS.GETWALLS()\n');
		const graph = this.scene.add.graphics();

		graph.setDepth(41000);
		graph.lineStyle(3, 0x000, 1);

		let vertices: Phaser.Math.Vector2[] = [];
		const hEdges: Phaser.Geom.Line[] = [];
		const vEdges: Phaser.Geom.Line[] = [];

		taro.$$('wall').forEach((wall) => {

			const x = wall._translate.x - wall._bounds2d.x2;
			const y = wall._translate.y - wall._bounds2d.y2;
			const w = wall._bounds2d.x;
			const h = wall._bounds2d.y;
			vertices.push(
				new Phaser.Math.Vector2(x, y),
				new Phaser.Math.Vector2(x + w, y),
				new Phaser.Math.Vector2(x + w, y + h),
				new Phaser.Math.Vector2(x, y + h)
			);
			hEdges.push(
				new Phaser.Geom.Line(x, y, x + w, y),
				new Phaser.Geom.Line(x, y + h, x + w, y + h)
			);
			vEdges.push(
				new Phaser.Geom.Line(x, y, x, y + h),
				new Phaser.Geom.Line(x + w, y, x + w, y + h)
			);
		});

		graph.lineStyle(2, 0x00FF66, 1);
		hEdges.forEach((e) => {
			graph.lineBetween(e[0][0], e[1], e[0][1], e[1]);
		});
		graph.lineStyle(2, 0xFFFF99, 1);
		vEdges.forEach((e) => {
			graph.lineBetween(e[1], e[0][0], e[1], e[0][1]);
		});

		vertices = _.uniqWith(vertices, _.isEqual);

		graph.fillStyle(0xFF9999, 0.8);
		vertices.forEach((v) => {
			graph.fillCircle(v[0], v[1], 4);
		});

		// arbitrary static player position
		const play = { x: 300, y: 300 };

		// draw lines from player to each vertex
		graph.lineStyle(2, 0x0099FF, 1);

		let v: vertex;
		for (v of vertices) {
			graph.lineBetween(play.x, play.y, v[0], v[1]);
		}
	}

	createFieldOfView(): void {
		// for now hard code range
		// TODO: extract range from config
		const fov = Phaser.Geom.Rectangle.FromXY(
			Math.max(0, player.x - LIMIT),
			Math.max(0, player.y - LIMIT),
			Math.min(MAPWIDTH, player.x + LIMIT),
			Math.min(MAPHEIGHT, player.y + LIMIT)
		);

	}
}

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = RaycastShadows;
}
