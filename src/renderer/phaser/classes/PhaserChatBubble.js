class PhaserChatBubble extends Phaser.GameObjects.Container {
    constructor(scene, chatText, unit) {
        super(scene);
        this.unit = unit;
        const bubble = this.bubble = scene.add.graphics();
        this.add(bubble);
        /*const text = this.bitmapText = scene.add.bitmapText(
            0, 0,
            BitmapFontManager.font(scene, 'Arial', true, false, '#FFFFFF')
        );*/
        const text = this.textObject = scene.add.text(0, 0, this.trimText(chatText), {
            font: '600 24px Arial',
            color: '#ffffff',
            align: 'center'
        });
        text.setOrigin(0.5);
        text.depth = 1;
        if (this.scene.renderer.type !== Phaser.CANVAS)
            text.setResolution(2);
        //this.textObject.setScale(0.5);
        // needs to be created with the correct scale of the client
        this.setScale(1 / this.scene.cameras.main.zoom);
        text.setFontSize(12);
        //text.setCenterAlign();
        text.setOrigin(0.5);
        //text.letterSpacing = -0.6;
        this.add(text);
        if (scene.renderer.type === Phaser.CANVAS) {
            //text.visible = false;
            /*const rt = this.rtText = scene.add.renderTexture(0, 0);
            rt.setOrigin(0.5);

            this.add(rt);*/
        }
        scene.add.existing(this);
        this.showMessage(chatText);
    }
    showMessage(chatText) {
        //const text = this.bitmapText;
        /*text.setText(BitmapFontManager.sanitize(
            text.fontData, this.trimText(chatText)
        ));*/
        const text = this.textObject;
        text.setText(this.trimText(chatText));
        /*const rt = this.rtText;
        if (rt) {
            rt.resize(text.width, text.height);
            rt.clear();
            rt.draw(text, text.width/2, text.height/2);
        }*/
        this.drawBubble();
        this.updateScale();
        this.updateOffset();
        this.fadeOut();
    }
    fadeOut() {
        const scene = this.scene;
        // reset fade timer and tween
        if (this.fadeTimerEvent) {
            scene.time.removeEvent(this.fadeTimerEvent);
            this.fadeTimerEvent = null;
        }
        if (this.fadeTween) {
            this.fadeTween.remove();
            this.fadeTween = null;
        }
        this.visible = true;
        this.alpha = 1;
        this.fadeTimerEvent = scene.time.delayedCall(3000, () => {
            this.fadeTimerEvent = null;
            this.fadeTween = scene.tweens.add({
                targets: this,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.fadeTween = null;
                    this.visible = false;
                }
            });
        });
    }
    updateScale() {
        this.setScale(1 / this.scene.cameras.main.zoom);
    }
    trimText(chatText) {
        if (chatText.length > 43) {
            chatText = chatText.substring(0, 40);
            chatText += '...';
        }
        return chatText;
    }
    drawBubble() {
        const bubble = this.bubble;
        //const text = this.rtText || this.bitmapText;
        const text = this.textObject;
        const width = text.width + 20;
        const height = text.height + 10;
        bubble.clear();
        bubble.fillStyle(0x000000, 0.5);
        bubble.fillRoundedRect(-width / 2, -height / 2, width, height, 5);
        bubble.fillTriangle(0, height / 2 + 7, 7, height / 2, -7, height / 2);
    }
    updateOffset() {
        const { sprite, label, gameObject } = this.unit;
        const { displayHeight, displayWidth } = sprite;
        const labelHeight = label.getBounds().height;
        this.offset = displayHeight / 2 + labelHeight * 4;
        /*this.offset =  25 +
            (sprite.displayHeight + sprite.displayWidth) / 4 +
            label.height * 2;*/
        this.y = gameObject.y - this.offset;
    }
    updatePosition() {
        const { x, y } = this.unit.gameObject;
        this.x = x;
        this.y = y - this.offset;
    }
}
//# sourceMappingURL=PhaserChatBubble.js.map