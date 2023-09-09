class AbilityBar extends Phaser.GameObjects.Container{
    buttons: Record<string, AbilityButton> = {};

    buttonSize = 45;
    buttonInterval = 3;
    buttonRadius = 3;

    constructor(public scene: UiScene) {
		super(scene);
        if (taro.isMobile) {
            this.buttonSize = 70;
            this.buttonInterval = 4;
            this.buttonRadius = 35;
        }
        this.x = this.scene.sys.game.canvas.width / 2;
        this.y = this.scene.sys.game.canvas.height * 0.5 + 200;
        scene.add.existing(this);
	}

    addButton(abilityId: string, ability: UnitAbility, key: string) {
        const button = new AbilityButton(this.scene, ability.name, key, 'description', ability.iconUrl, Object.values(this.buttons).length * (this.buttonSize + this.buttonInterval), 0, this.buttonSize, this.buttonRadius);
        this.buttons[abilityId] = button;
        this.add(button);
        this.x = this.scene.sys.game.canvas.width / 2 - Object.values(this.buttons).length * (this.buttonSize + this.buttonInterval) / 2;
    }

    clear() {
        Object.values(this.buttons).forEach(button => button.destroy());
        this.buttons = {};
    }
}