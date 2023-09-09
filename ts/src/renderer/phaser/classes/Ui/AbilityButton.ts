class AbilityButton extends Phaser.GameObjects.Container {
    name: string;
	button: any;
	//active: boolean;
	//hidden: boolean;
	//isHover = false;
	image: Phaser.GameObjects.Image;
	label: Phaser.GameObjects.BitmapText;
    //width: number;
    //height: number;
	timer: number | NodeJS.Timeout;
    backgroundColor: number;
    activeColor: number;

	constructor(
        scene: UiScene,
		name: string,
		public key: string,
		tooltipText: string,
		texture: string | null,
		x: number,
		y: number,
        public size: number,
        public radius: number,
		//w: number,
		//container: Phaser.GameObjects.Container,
		//func: (...args: any[]) => void,
		//value?: number | string,

		//defaultVisible = true,
	) {
        super(scene);
		this.name = name;
        const backgroundColor = this.backgroundColor = 0x000000;
        const activeColor = this.activeColor = 0xFFFF00;
        this.x = x;
        this.y = y;
        // @ts-ignore
        const button = this.button = scene.add.rexRoundRectangle(0, 0, size, size, radius, backgroundColor, 0.7);
		button.setInteractive();
        this.add(button);

		//button.setVisible(defaultVisible);
		if (texture && scene.textures.exists(texture)) {
			const image = this.image = scene.add.image(0, 0, texture).setDisplaySize(size * 0.8, size * 0.8);
            this.add(image);
		} /*else {
			const label = scene.add.bitmapText(
				x + w / 2, y + h / 2,
				BitmapFontManager.font(scene,
					'Verdana', false, false, '#000000'
				),
				text,
				22
			);
			label.setOrigin(0.5);
			label.letterSpacing = 1.3;
            //label.setVisible(defaultVisible);
			//container.add(label);
			this.label = label;
		}*/
        const label = scene.add.bitmapText(
            - 7 + size / 2, + 7 - size / 2,
            BitmapFontManager.font(scene, 'Verdana', true, false, '#FFFFFF'),
            key, 18
        );
        label.setOrigin(0.5);
        label.letterSpacing = 1.3;
        this.add(label);
        //label.setVisible(defaultVisible);
        //container.add(label);
        this.label = label;

        scene.add.existing(this);

		button.on('pointerdown', () => {
            //console.log('ability pointerdown');
            if (key) {
                taro.network.send('playerKeyDown', {
                    // @ts-ignore
                    device: 'key', key: key.toLowerCase()
                });
            }
            this.activate(true);
			/*if (value || value === 0) func(value);
			else func();*/
		});
        button.on('pointerup', () => {
            if (key) {
                taro.network.send('playerKeyUp', {
                    // @ts-ignore
                    device: 'key', key: key.toLowerCase()
                });
            }
            this.activate(false);
        });
        //const gameScene = taro.renderer.scene.getScene('Game');
        if (taro.isMobile) {
            if (this.image) label.visible = false;
        } else {
		    button.on('pointerover', () => {
                //gameScene.input.setTopOnly(true);
		    	scene.tooltip.showMessage(name, tooltipText);
		    	clearTimeout(this.timer);
		    });
		    button.on('pointerout', () => {
		    	scene.tooltip.fadeOut();
		    });
        }
	}

    customize (size: number, radius: number): void {
        this.size = size;
        this.radius = radius;
        this.button.setSize(size, size);
        this.button.setRadius(radius);
        this.image?.setDisplaySize(size * 0.8, size * 0.8);
        this.label.setPosition(- 7 + size / 2, + 7 - size / 2);
    }

    activate(bool: boolean): void {
        if (bool) {
            this.button.setFillStyle(this.activeColor, 1);
        } else {
            this.button.setFillStyle(this.backgroundColor, 0.7);
        }
    }

	/*highlight(mode: 'no' | 'active' | 'hidden'): void {
		switch (mode) {
			case 'hidden':
				this.hidden = true;
				this.active = false;
				this.button.setFillStyle(this.devModeTools['COLOR_GRAY'], 1);
				break;

			case 'active':
				this.active = true;
				this.hidden = false;
				this.button.setFillStyle(this.devModeTools['COLOR_LIGHT'], 1);
				break;

			case 'no':
				if (!this.hidden) {
					this.active = false;
					this.button.setFillStyle(this.devModeTools['COLOR_WHITE'], 1);
				}
				break;
		}
	}*/

	increaseSize(value: boolean): void {
		this.button.setScale(1 + (Number(value) * 0.2), 1 + (Number(value) * 0.10));
		/*if (value) {
			this.button.setStrokeStyle(2, 0x000000, 1);
		}
		else {
			this.button.setStrokeStyle();
		}*/
	}
}