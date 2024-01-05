type vertex = [number, number];
type edge = [vertex, number];
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

		let vertices: vertex[] = [];
		const hEdges: edge[] = [];
		const vEdges: edge[] = [];

		taro.$$('wall').forEach((wall) => {

			const x = wall._translate.x - wall._bounds2d.x2;
			const y = wall._translate.y - wall._bounds2d.y2;
			const w = wall._bounds2d.x;
			const h = wall._bounds2d.y;
			vertices.push(
				[x, y],
				[x + w, y],
				[x + w, y + h],
				[x, y + h]
			);
			hEdges.push(
				[[x, x + w], y],
				[[x, x + w], y + h]
			);
			vEdges.push(
				[[y, y + h], x],
				[[y, y + h], x + w]
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
}

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = RaycastShadows;
}