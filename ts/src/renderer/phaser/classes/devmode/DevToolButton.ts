class DevToolButton {
    button: Phaser.GameObjects.Rectangle;
    devModeTools: DevModeTools;
    active: boolean;

    constructor (
        devModeTools: DevModeTools,
        text: string,
        texture: string | null,
        x: number, 
        y: number, 
        w: number, 
        container: Phaser.GameObjects.Container, 
        func: (...args: any[]) => void, 
        value?: number
        ) {
        
        //const text = '+';
		//const w = 30;
		const h = 30;
		//const x = 0;
		//const y = -h -1;
        this.devModeTools = devModeTools;
        const button = this.button = devModeTools.scene.add.rectangle(x + w/2, y + h/2, w, h, devModeTools.COLOR_DARK);
		button.setInteractive();
		container.add(button);
		
        if (texture) {
            const image = devModeTools.scene.add.image(x + w/4 + h * 0.1, y + h * 0.1, texture)
						.setDisplaySize(h * 0.8, h * 0.8)
						.setOrigin(0)
            container.add(image);
        } else {
            const label = devModeTools.scene.add.text(
                x + w/2, y + h/2, text
            );
            label.setFontFamily('Verdana');
            label.setColor('#000000')
		    label.setFontSize(26);
		    label.setOrigin(0.5);
		    label.setResolution(4);
		    container.add(label);
        }
		button.on('pointerdown', () => {
			if (value || value === 0) func(value);
			else func();
		});
    }

    highlight (boolean: boolean): void {
        this.active = boolean;
        if (boolean) {
            this.button.setFillStyle(this.devModeTools.COLOR_LIGHT, 1);
        }
        else {
            this.button.setFillStyle(this.devModeTools.COLOR_DARK, 1);
        }
    }
}