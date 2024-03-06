class ThreeFloatingText {
	constructor(x: number, y: number, z: number, text: string, color: string | number) {
		console.log(x, y, z, text, color);

		new TWEEN.Tween({ x, y, z })
			.to({ x: 100, y: 500, z: 1000 }, 500)
			.onUpdate(({ x, y, z }) => console.log(x, y, z))
			.start();
	}
}
