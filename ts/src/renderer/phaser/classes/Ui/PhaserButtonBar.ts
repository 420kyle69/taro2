class PhaserButtonBar extends Phaser.GameObjects.Container{
    buttons: Record<string, PhaserButton> = {};

    buttonSize = 45;
    buttonInterval = 4;
    buttonRadius = 3;

    constructor(public scene: UiScene) {
		super(scene);
        if (taro.isMobile) {
            this.buttonSize = 50;
            this.buttonInterval = 6;
            this.buttonRadius = 25;
        }
        this.updatePosition();
        scene.add.existing(this);

        taro.client.on('update-abilities-position', () => {
            this.updatePosition();
        });
	}

    addButton(abilityId: string, ability: UnitAbility, key: string) {
        const button = new PhaserButton(this.scene, ability, abilityId, key, 'description', ability?.iconUrl, Object.values(this.buttons).length * (this.buttonSize + this.buttonInterval), 0, this.buttonSize * window.devicePixelRatio, this.buttonRadius * window.devicePixelRatio);
        this.buttons[key] = button;
        this.add(button);
        this.updatePosition();
		return button;
    }

    updatePosition() {
		if (taro.isMobile) {
			taro.mobileControls.updateButtonPos();
		}
    }

    clear() {
        Object.values(this.buttons).forEach(button => button.destroy());
        this.buttons = {};
    }
}