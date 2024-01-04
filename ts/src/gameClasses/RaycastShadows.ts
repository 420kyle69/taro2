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

		taro.$$('wall').forEach((wall) => {
			const box = {
				x: wall._translate.x - wall._bounds2d.x2,
				y: wall._translate.y - wall._bounds2d.y2,
				x2: wall._bounds2d.x,
				y2: wall._bounds2d.y,
			};

			graph.strokeRect(box.x, box.y, box.x2, box.y2);
		});
	}
}

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = RaycastShadows;
}