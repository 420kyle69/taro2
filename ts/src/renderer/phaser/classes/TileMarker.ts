class TileMarker {
    graphics: Phaser.GameObjects.Graphics;
    active: boolean;

	constructor (
		scene: Phaser.Scene,
        gameMap: Phaser.Tilemaps.Tilemap,
        w: number
	) {
        this.active = true;
        this.graphics = scene.add.graphics();
		this.graphics.lineStyle(w, 0x000000, 1);
		if (ige.game.data.defaultData.dontResize) {
			this.graphics.strokeRect(0, 0, gameMap.tileWidth, gameMap.tileHeight);
		} else {
			this.graphics.strokeRect(0, 0, 64, 64);
		}
		this.graphics.setVisible(false);
	}
}