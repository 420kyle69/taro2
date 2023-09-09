class UiScene extends PhaserScene {
    tooltip: DevTooltip;
    abilityBar: AbilityBar;
	constructor() {
		super({ key: 'Ui', active: true });
	}

	init (): void {
		return;
	}

	create (): void {
        if (!taro.isMobile) {
            this.tooltip = new DevTooltip(this);
        }
        const abilityBar = this.abilityBar = new AbilityBar(this);

        taro.client.on('create-ability-bar', (data: {keybindings: Record<string, ControlAbility>, abilities: Record<string, UnitAbility>}) => {
            const keybindings = data.keybindings;
            const abilities = data.abilities;
            abilityBar.clear();
            Object.entries(abilities).forEach(([abilityId, ability]) => {
                let key;
                Object.entries(keybindings).forEach(([keybindingKey, keybinding]) => {
                    if (keybinding.keyDown?.abilityId === abilityId || keybinding.keyUp?.abilityId === abilityId) {
                        key = keybindingKey;
                    }
                });
                abilityBar.addButton(abilityId, ability, key);
            });
		});

        taro.client.on('start-press-key', (abilityId: string) => {
            abilityBar.buttons[abilityId].activate(true);
        });

        taro.client.on('stop-press-key', (abilityId: string) => {
            abilityBar.buttons[abilityId].activate(false);
            //abilityBar.buttons[abilityId].customize(abilityBar.buttons[abilityId].size, abilityBar.buttons[abilityId].size/2);
        });
	}

	preload (): void {
        this.load.plugin('rexroundrectangleplugin', '/assets/js/rexroundrectangleplugin.min.js', true);
        Object.values(taro.game.data.abilities).forEach(ability => {
            if (ability.iconUrl) this.load.image(ability.iconUrl, ability.iconUrl);
        });
        Object.values(taro.game.data.unitTypes).forEach(unitType => {
            if (unitType.controls.unitAbilities) {
                Object.values(unitType.controls.unitAbilities).forEach(ability => {
                    if (ability.iconUrl) this.load.image(ability.iconUrl, ability.iconUrl);
                });
            }
        });
	}

	update (): void {
		return;
	}
}

