class PhaserButtonBar extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.buttons = {};
        this.buttonSize = 45;
        this.buttonInterval = 4;
        this.buttonRadius = 3;
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
    addButton(abilityId, ability, key) {
        const button = new PhaserButton(this.scene, ability, abilityId, key, 'description', ability === null || ability === void 0 ? void 0 : ability.iconUrl, Object.values(this.buttons).length * (this.buttonSize + this.buttonInterval), 0, this.buttonSize * window.devicePixelRatio, this.buttonRadius * window.devicePixelRatio);
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
//# sourceMappingURL=PhaserButtonBar.js.map