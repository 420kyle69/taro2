class UiScene extends PhaserScene {
    constructor() {
        super({ key: 'Ui', active: true });
    }
    init() {
        return;
    }
    create() {
        if (!taro.isMobile) {
            return;
        }
        const phaserButtonBar = this.phaserButtonBar = new PhaserButtonBar(this);
        taro.client.on('enterMapTab', () => {
            this.scene.setVisible(false);
        });
        taro.client.on('leaveMapTab', () => {
            this.scene.setVisible(true);
        });
        taro.client.on('start-press-key', (key) => {
            var _a;
            (_a = phaserButtonBar.buttons[key]) === null || _a === void 0 ? void 0 : _a.activate(true);
        });
        taro.client.on('stop-press-key', (key) => {
            var _a;
            (_a = phaserButtonBar.buttons[key]) === null || _a === void 0 ? void 0 : _a.activate(false);
        });
        taro.client.on('start-casting', (key) => {
            var _a;
            (_a = phaserButtonBar.buttons[key]) === null || _a === void 0 ? void 0 : _a.casting(true);
        });
        taro.client.on('stop-casting', (key) => {
            var _a;
            (_a = phaserButtonBar.buttons[key]) === null || _a === void 0 ? void 0 : _a.casting(false);
        });
        taro.client.on('start-ability-cooldown', (key) => {
            var _a;
            (_a = phaserButtonBar.buttons[key]) === null || _a === void 0 ? void 0 : _a.cooldown(true);
        });
        taro.client.on('stop-ability-cooldown', (key) => {
            var _a;
            (_a = phaserButtonBar.buttons[key]) === null || _a === void 0 ? void 0 : _a.cooldown(false);
        });
    }
    preload() {
        this.load.plugin('rexroundrectangleplugin', '/assets/js/rexroundrectangleplugin.min.js', true);
        this.load.plugin('rexcirclemaskimageplugin', '/assets/js/rexcirclemaskimageplugin.min.js?v=1.1', true);
        Object.values(taro.game.data.abilities).forEach(ability => {
            if (ability.iconUrl)
                this.load.image(ability.iconUrl, this.patchAssetUrl(ability.iconUrl));
        });
        Object.values(taro.game.data.unitTypes).forEach(unitType => {
            var _a;
            // temp fix for undefined crash
            if (((_a = unitType === null || unitType === void 0 ? void 0 : unitType.controls) === null || _a === void 0 ? void 0 : _a.unitAbilities) && Object.keys(unitType.controls.unitAbilities).length > 0) {
                Object.values(unitType.controls.unitAbilities).forEach(ability => {
                    if (ability.iconUrl)
                        this.load.image(ability.iconUrl, this.patchAssetUrl(ability.iconUrl));
                });
            }
        });
    }
    update() {
        return;
    }
}
//# sourceMappingURL=UiScene.js.map