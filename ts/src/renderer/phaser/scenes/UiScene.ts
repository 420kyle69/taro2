class UiScene extends PhaserScene {
	abilityIconsContainer: Phaser.GameObjects.Container;
	constructor() {
		super({ key: 'UI', active: true });
	}

	init (): void {
		this.abilityIconsContainer = new Phaser.GameObjects.Container(this, 64, 64);

		taro.client.on('ability-icons', (abilities: Record<string, any>) => {
			this.generateAbilityIcons(abilities);
		});

		this.add.existing(this.abilityIconsContainer);
	}

	create (): void {
		return;
	}

	preload (): void {
		const abilities = taro.game.data.abilities;

		for (let abilityId in abilities) {
			this.load.image(`ability/${abilityId}`, this.patchAssetUrl(abilities[abilityId].iconUrl));
		}
	}

	update (): void {
		return;
	}

	generateAbilityIcons (abilities: Record<string, any>): void {
		console.log(abilities);

		let x = 0;
		const y = 0;
		const spacer = 16;

		for (let abilityId in abilities) {
			this.abilityIconsContainer.add(new PhaserAbilityIcon(
				this,
				x,
				y,
				`ability/${abilityId}`,
				abilityId
			));
			x += spacer;
		}
	}
}

class PhaserAbilityIcon extends Phaser.GameObjects.Sprite {
	private abilityId: string;

	constructor(
		scene: UiScene,
		x: number,
		y: number,
		texture: string,
		abilityId: string
	) {
		super(
			scene,
			x,
			y,
			texture
		);

		this.abilityId = abilityId;
		this.setVisible(true);
	}
}
