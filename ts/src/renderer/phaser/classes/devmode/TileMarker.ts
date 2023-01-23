class TileMarker {
    graphics: Phaser.GameObjects.Graphics;
	preview: Phaser.GameObjects.Image;
	visiblePreview: boolean;
	active: boolean;

	constructor (
		scene: Phaser.Scene,
        map: Phaser.Tilemaps.Tilemap,
		palette: boolean,
        w: number
	) {
        this.active = true;
		this.visiblePreview = false;

        this.graphics = scene.add.graphics();
		this.graphics.lineStyle(w, 0x000000, 1);
		if (ige.game.data.defaultData.dontResize) {
			this.graphics.strokeRect(0, 0, map.tileWidth, map.tileHeight);
		} else {
			this.graphics.strokeRect(0, 0, 64, 64);
		}
		this.graphics.setVisible(false);

		if (!palette) {
			const data = ige.game.data;
			const tileset = data.map.tilesets[0];
			const key = `tiles/${tileset.name}`;
			const extrudedKey = `extruded-${key}`;
			
			const preview = this.preview = scene.add.image(0, 0, extrudedKey, 0);
			preview.setOrigin(0,0).setTint(0xabcbff).setAlpha(0.75).setVisible(false);
		}
		
	}

	/*activate (value: boolean): void {
		this.active = value;
		this.graphics.setVisible(value);
		if (this.preview) this.preview.setVisible(value);
	}*/

	
}