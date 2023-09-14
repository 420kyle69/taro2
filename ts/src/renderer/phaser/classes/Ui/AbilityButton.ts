class AbilityButton extends Phaser.GameObjects.Container {
    name: string;
	button: any;
	image: Phaser.GameObjects.Image;
	label: Phaser.GameObjects.BitmapText;
	timer: number | NodeJS.Timeout;
    backgroundColor: number;
    activeColor: number;
    fx: Phaser.FX.Bloom;

	constructor(
        scene: UiScene,
		name: string,
        public id: string,
		public key: string,
		tooltipText: string,
		texture: string | null,
		x: number,
		y: number,
        public size: number,
        public radius: number,

		//bar: Phaser.GameObjects.Container,
	) {
        super(scene);
		this.name = name;
        let backgroundColor = this.backgroundColor = 0x000000;
        if (taro.isMobile) backgroundColor = this.backgroundColor = 0x333333;
        this.activeColor = 0xFFFF00;
        this.x = x;
        this.y = y;
        // @ts-ignore
        const button = this.button = scene.add.rexRoundRectangle(0, 0, size, size, radius, backgroundColor, 0.7);
		button.setInteractive();
        this.add(button);

        // image
		if (texture && scene.textures.exists(texture)) {
			const image = this.image = scene.add.image(0, 0, texture).setDisplaySize(size * 0.8, size * 0.8);
            this.add(image);
            this.fx = image.preFX.addBloom(0xffffff, 1, 1, 2, 1.2).setActive(false);
		}
        // label
        if (key && key.length < 2) {
            console.log('key', key.length)
            const label = this.label = scene.add.bitmapText(
                - 7 + size / 2, + 7 - size / 2,
                BitmapFontManager.font(scene, 'Verdana', true, false, '#FFFFFF'),
                key.toUpperCase(), 16
            );
            label.setOrigin(0.5);
            label.letterSpacing = 1.3;
            this.add(label);
        }

        scene.add.existing(this);

        if (taro.isMobile) {
            //hide key on mobile
            //if (this.image) label.visible = false;
            const mobileControlScene = taro.renderer.scene.getScene('MobileControls') as MobileControlsScene;
            let clicked = false;
            button.on('pointerdown', () => {
                mobileControlScene.disablePointerEvents = true;
                this.activate(true);
                if (clicked) return;
                clicked = true;

                if (key) {
                    taro.client.emit('key-down', {
                        device: 'key', key: key.toLowerCase()
                    });
                } else {
                    // ability have no keybinding
                }
            });
            const onPointerEnd = () => {
                mobileControlScene.enablePointerNextUpdate = true;
                this.activate(false);
                if (!clicked) return;
                clicked = false;
                
                if (key) {
                    taro.client.emit('key-up', {
                        device: 'key', key: key.toLowerCase()
                    });
                } else {
                    // ability have no keybinding
                }
            };
            button.on('pointerup', onPointerEnd);
            button.on('pointerout', onPointerEnd);
        } else {
            button.on('pointerdown', () => {
                taro.client.isPressingAbility = true;
                if (key) {
                    taro.client.emit('key-down', {
                        device: 'key', key: key.toLowerCase()
                    });
                } else {
                    // ability have no keybinding
                }
            });
            button.on('pointerup', () => {
                taro.client.isPressingAbility = false;
                if (key) {
                    taro.client.emit('key-up', {
                        device: 'key', key: key.toLowerCase()
                    });
                } else {
                    // ability have no keybinding
                }
            });
		    button.on('pointerover', () => {
		    	//scene.tooltip.showMessage(name, tooltipText);
		    	clearTimeout(this.timer);
		    });
		    button.on('pointerout', () => {
		    	//scene.tooltip.fadeOut();
                this.activate(false);
		    });
        }
	}

    customize (size: number, radius: number): void {
        this.size = size;
        this.radius = radius;
        this.button.setSize(size, size);
        this.button.setRadius(radius);
        this.image?.setDisplaySize(size * 0.8, size * 0.8);
        this.label?.setPosition(- 7 + size / 2, + 7 - size / 2);
    }

    activate(bool: boolean): void {
        if (bool) {
            this.button.setFillStyle(this.activeColor, 1);
        } else {
            this.button.setFillStyle(this.backgroundColor, 0.7);
        }
    }

    casting(bool: boolean): void {
        if (bool) {
            if (this.image) this.fx.setActive(true);
        } else {
            if (this.image) this.fx.setActive(false)
        }
    }
}