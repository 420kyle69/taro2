class PhaserUnit extends PhaserAnimatedEntity {
    constructor(scene, entity) {
        super(scene, entity, `unit/${entity._stats.cellSheet.url}`);
        this.attributes = [];
        const translate = entity._translate;
        const gameObject = scene.add.container(translate.x, translate.y, [this.sprite]);
        this.gameObject = gameObject;
        this.updateGameObjectSize();
        // this is hbz-index logic but could be useful for other container operations
        this.gameObject.spriteHeight2 = this.sprite.displayHeight / 2;
        Object.assign(this.evtListeners, {
            follow: entity.on('follow', this.follow, this),
            'update-texture': entity.on('update-texture', this.updateTexture, this),
            'update-label': entity.on('update-label', this.updateLabel, this),
            'show-label': entity.on('show-label', this.showLabel, this),
            'hide-label': entity.on('hide-label', this.hideLabel, this),
            'fading-text': entity.on('fading-text', this.fadingText, this),
            'render-attributes': entity.on('render-attributes', this.renderAttributes, this),
            'update-attribute': entity.on('update-attribute', this.updateAttribute, this),
            'render-chat-bubble': entity.on('render-chat-bubble', this.renderChat, this),
            'transform-debug': entity.on('transform-debug', this.transformDebug, this),
        });
        this.scene.unitsList.push(this);
        this.scene.renderedEntities.push(this.gameObject);
        this.zoomEvtListener = taro.client.on('scale', this.scaleElements, this);
        this.sprite.setInteractive();
        this.sprite.on('pointerdown', (p) => {
            if (taro.game.data.defaultData.contextMenuEnabled && (!taro.developerMode.active || (taro.developerMode.active && taro.developerMode.activeTab === 'play')) && p.rightButtonDown()) {
                const ownerPlayer = taro.$(this.entity._stats.ownerId);
                if (ownerPlayer._stats.controlledBy === 'human') {
                    showUserDropdown({ ownerId: this.entity._stats.ownerId, pointer: p });
                }
            }
        });
    }
    updateTexture(data) {
        if (data === 'basic_texture_change') {
            this.sprite.anims.stop();
            this.key = `unit/${this.entity._stats.cellSheet.url}`;
            if (!this.scene.textures.exists(this.key)) {
                this.scene.loadEntity(this.key, this.entity._stats);
                this.scene.load.on(`filecomplete-image-${this.key}`, function cnsl() {
                    if (this && this.sprite) {
                        this.setTexture(this.key);
                        this.sprite.texture.setFilter(this.scene.filter);
                        const bounds = this.entity._bounds2d;
                        this.sprite.setDisplaySize(bounds.x, bounds.y);
                    }
                }, this);
                this.scene.load.start();
            }
            else {
                this.setTexture(this.key);
                const bounds = this.entity._bounds2d;
                this.sprite.setDisplaySize(bounds.x, bounds.y);
            }
            // GameScene's load entity doesn't create sprite sheets so we have horrible
            // errors when we try to create animations
            if (this.sprite.texture.frameTotal === 1 || this.sprite.texture.key === 'pack-result') {
                return;
            }
            for (let animationsKey in this.entity._stats.animations) {
                const animation = this.entity._stats.animations[animationsKey];
                const frames = animation.frames;
                const animationFrames = [];
                for (let i = 0; i < frames.length; i++) {
                    // correction for 0-based indexing
                    animationFrames.push(frames[i] - 1);
                }
                if (animationFrames.length === 0) {
                    // avoid crash by giving it frame 0 if no frame data provided
                    animationFrames.push(0);
                }
                const anims = this.scene.anims;
                if (anims.exists(`${this.key}/${animationsKey}`)) {
                    anims.remove(`${this.key}/${animationsKey}`);
                }
                anims.create({
                    key: `${this.key}/${animationsKey}`,
                    frames: anims.generateFrameNumbers(this.key, {
                        frames: animationFrames
                    }),
                    frameRate: animation.framesPerSecond || 15,
                    repeat: (animation.loopCount - 1) // correction for loop/repeat values
                });
            }
        }
        else if (data === 'using_skin') {
            this.sprite.anims.stop();
            this.key = `unit/${this.entity._stats.cellSheet.url}`;
            if (!this.scene.textures.exists(this.key)) {
                this.scene.loadEntity(this.key, this.entity._stats);
                this.scene.load.on(`filecomplete-image-${this.key}`, function cnsl() {
                    if (this && this.sprite) {
                        this.setTexture(this.key);
                        this.sprite.texture.setFilter(this.scene.filter);
                        const bounds = this.entity._bounds2d;
                        this.sprite.setDisplaySize(bounds.x, bounds.y);
                    }
                }, this);
                this.scene.load.start();
            }
            else {
                this.setTexture(this.key);
                const bounds = this.entity._bounds2d;
                this.sprite.setDisplaySize(bounds.x, bounds.y);
            }
        }
        else {
            this.key = `unit/${this.entity._stats.cellSheet.url}`;
            this.setTexture(this.key);
            const bounds = this.entity._bounds2d;
            this.sprite.setDisplaySize(bounds.x, bounds.y);
        }
    }
    depth(value) {
        const scene = this.gameObject.scene;
        this.gameObject.taroDepth = value;
        if (scene.heightRenderer) {
            scene.heightRenderer.adjustDepth(this.gameObject);
        }
        else {
            this.gameObject.setDepth(value);
        }
    }
    transform(data) {
        super.transform(data);
        if (this.chat) {
            this.chat.updatePosition();
        }
    }
    size(data) {
        super.size(data);
        if (data.height) {
            this.gameObject.spriteHeight2 = this.sprite.displayHeight / 2;
        }
        const containerSize = Math.max(this.sprite.displayHeight, this.sprite.displayWidth);
        this.gameObject.setSize(containerSize, containerSize);
        if (this.label) {
            this.updateLabelOffset();
        }
        if (this.attributesContainer) {
            this.updateAttributesOffset();
        }
        this.updateGameObjectSize();
    }
    updateLabelOffset() {
        if (this.label) {
            const { displayHeight, displayWidth } = this.sprite;
            const labelHeight = this.label.getBounds().height;
            this.label.y = -displayHeight / 2 - labelHeight * 1.5;
            /*if (this.rtLabel) {
                this.rtLabel.y = this.label.y;
            }*/
        }
        this.updateGameObjectSize();
    }
    updateAttributesOffset() {
        const { displayHeight, displayWidth } = this.sprite;
        this.attributesContainer.y = (this.attributesContainer.height * this.attributesContainer.scaleX) / 2 + 16 * this.attributesContainer.scaleX + displayHeight / 2;
        this.updateGameObjectSize();
    }
    updateGameObjectSize() {
        const containerSize = Math.max(this.sprite.displayHeight, this.sprite.displayWidth);
        let height = containerSize;
        if (this.attributesContainer) {
            height += this.attributesContainer.height;
            height += this.attributesContainer.y;
        }
        if (this.label) {
            height += this.label.height;
            height -= this.label.y;
        }
        this.gameObject.setSize(containerSize, containerSize + height);
    }
    follow() {
        var _a, _b, _c, _d;
        const camera = this.scene.cameras.main;
        if (camera._follow === this.gameObject) {
            return;
        }
        this.scene.cameraTarget = this.gameObject;
        if (!taro.developerMode.active || taro.developerMode.activeTab === 'play') {
            let trackingDelay = ((_d = (_c = (_b = (_a = taro === null || taro === void 0 ? void 0 : taro.game) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.settings) === null || _c === void 0 ? void 0 : _c.camera) === null || _d === void 0 ? void 0 : _d.trackingDelay) || 3;
            trackingDelay = trackingDelay / taro.fps();
            camera.startFollow(this.gameObject, true, trackingDelay, trackingDelay);
        }
    }
    getLabel() {
        if (!this.label) {
            const scene = this.scene;
            /*const label = this.label = scene.add.bitmapText(0, 0,
                BitmapFontManager.font(scene, // default font
                    'Verdana', false, false, '#FFFFFF'
                ),
                'cccccc',
                16
            );
            label.letterSpacing = 1.3;

            // needs to be created with the correct scale of the client
            label.setScale(1 / scene.cameras.main.zoom);*/
            const label = this.label = scene.add.text(0, 0, 'cccccc');
            // needs to be created with the correct scale of the client
            this.label.setScale(1 / scene.cameras.main.zoom);
            label.setOrigin(0.5);
            this.gameObject.add(label);
            /*if (scene.renderer.type === Phaser.CANVAS) {
                const rt = this.rtLabel = scene.add.renderTexture(0, 0);
                rt.setScale(label.scale);
                rt.setOrigin(0.5);

                this.gameObject.add(rt);
            }*/
        }
        return this.label;
    }
    updateLabel(data) {
        const label = this.getLabel();
        //const rt = this.rtLabel;
        //label.visible = !rt;
        /*label.setFont(BitmapFontManager.font(this.scene,
            'Verdana', data.bold,
            taro.game.data.settings
                .addStrokeToNameAndAttributes !== false,
            data.color || '#FFFFFF'
        ));
        label.setText(BitmapFontManager.sanitize(
            label.fontData, data.text || ''
        ));*/
        label.visible = true;
        label.setFontFamily('Verdana');
        label.setFontSize(16);
        label.setFontStyle(data.bold ? 'bold' : 'normal');
        label.setFill(`${data.color}` || '#fff');
        if (this.scene.renderer.type !== Phaser.CANVAS)
            label.setResolution(4);
        const strokeThickness = taro.game.data.settings
            .addStrokeToNameAndAttributes !== false ? 4 : 0;
        label.setStroke('#000', strokeThickness);
        label.setText(data.text || '');
        /*if (rt) {
            const tempScale = label.scale;
            label.setScale(1);

            rt.visible = true;
            rt.resize(label.width, label.height);
            rt.clear();
            rt.draw(label, label.width/2, label.height/2);

            label.setScale(tempScale);
        }*/
        this.updateLabelOffset();
        this.updateGameObjectSize();
    }
    showLabel() {
        /*const label = this.getLabel();
        const rt = this.rtLabel;

        label.visible = !rt;
        rt && (rt.visible = true);*/
        this.getLabel().visible = true;
    }
    hideLabel() {
        /*const label = this.getLabel();
        const rt = this.rtLabel;

        label.visible = false;
        rt && (rt.visible = false);*/
        this.getLabel().visible = false;
    }
    fadingText(data) {
        const offset = -25 - Math.max(this.sprite.displayHeight, this.sprite.displayWidth) / 2;
        new PhaserFloatingText(this.scene, {
            text: data.text || '',
            x: this.gameObject.x,
            y: this.gameObject.y + offset,
            color: data.color || '#fff'
        });
    }
    getAttributesContainer() {
        if (!this.attributesContainer) {
            this.attributesContainer = this.scene.add.container(0, 0);
            // needs to be created with the correct scale of the client
            this.attributesContainer.setScale(1 / this.scene.cameras.main.zoom);
            this.updateAttributesOffset();
            this.gameObject.add(this.attributesContainer);
        }
        return this.attributesContainer;
    }
    renderAttributes(data) {
        // creating attributeContainer on the fly,
        // only for units that have attribute bars
        this.getAttributesContainer();
        const attributes = this.attributes;
        // release all existing attribute bars
        attributes.forEach((a) => {
            PhaserAttributeBar.release(a);
        });
        attributes.length = 0;
        // add attribute bars based on passed data
        data.attrs.forEach((ad) => {
            const a = PhaserAttributeBar.get(this);
            a.render(ad);
            attributes.push(a);
        });
    }
    updateAttribute(data) {
        const attributes = this.attributes;
        let a;
        let i = 0;
        for (; i < attributes.length; i++) {
            if (attributes[i].name === data.attr.type) {
                a = attributes[i];
                break;
            }
        }
        if (!data.shouldRender) {
            if (a) {
                PhaserAttributeBar.release(a);
                attributes.splice(i, 1);
            }
            return;
        }
        if (!a) {
            a = PhaserAttributeBar.get(this);
            attributes.push(a);
        }
        a.render(data.attr);
    }
    renderChat(text) {
        if (this.chat) {
            this.chat.showMessage(text);
        }
        else {
            this.chat = new PhaserChatBubble(this.scene, text, this);
        }
    }
    scaleElements(data) {
        if (this.scaleTween) {
            this.scaleTween.stop();
            this.scaleTween = null;
        }
        const { ratio } = data;
        const targetScale = 1 / ratio;
        let targets = [];
        if (this.chat) {
            targets.push(this.chat);
        }
        if (this.attributesContainer) {
            targets.push(this.attributesContainer);
        }
        if (this.label) {
            targets.push(this.label);
            /*if (this.rtLabel) {
                targets.push(this.rtLabel);
            }*/
        }
        this.scaleTween = this.scene.tweens.add({
            targets: targets,
            duration: 1000,
            ease: Phaser.Math.Easing.Quadratic.Out,
            scale: targetScale,
            onComplete: () => {
                this.updateLabelOffset();
                this.updateAttributesOffset();
                this.scaleTween = null;
            }
        });
    }
    transformDebug(data) {
        if (data.debug === 'green-square') {
            if (!this.debugGameObject) {
                const bounds = this.entity._bounds2d;
                this.debugGameObject = this.scene.add.rectangle(0, 0, bounds.x, bounds.y);
                this.debugGameObject.setStrokeStyle(2, 0x008000);
            }
            this.debugGameObject.setPosition(data.x, data.y);
            this.debugGameObject.rotation = data.rotation;
        }
        else if (data.debug === 'blue-square') {
            if (!this.debugGameObjectBlue) {
                const bounds = this.entity._bounds2d;
                this.debugGameObjectBlue = this.scene.add.rectangle(0, 0, bounds.x, bounds.y);
                this.debugGameObjectBlue.setStrokeStyle(2, 0x0000FF);
            }
            this.debugGameObjectBlue.setPosition(data.x, data.y);
            this.debugGameObjectBlue.rotation = data.rotation;
        }
        else if (data.debug === 'red-square') {
            if (!this.debugGameObjectRed) {
                const bounds = this.entity._bounds2d;
                this.debugGameObjectRed = this.scene.add.rectangle(0, 0, bounds.x, bounds.y);
                this.debugGameObjectRed.setStrokeStyle(2, 0xFF0000);
            }
            this.debugGameObjectRed.setPosition(data.x, data.y);
            this.debugGameObjectRed.rotation = data.rotation;
        }
    }
    destroy() {
        this.scene.renderedEntities = this.scene.renderedEntities.filter(item => item !== this.gameObject);
        this.scene.unitsList = this.scene.unitsList.filter(item => item.entity.id() !== this.entity.id());
        taro.client.off('scale', this.zoomEvtListener);
        this.zoomEvtListener = null;
        if (this.scaleTween) {
            this.scaleTween.stop();
            this.scaleTween = null;
        }
        if (this.chat) {
            this.chat.destroy();
            this.chat = null;
        }
        // release all instantiated attribute bars
        this.attributes.forEach((a) => {
            PhaserAttributeBar.release(a);
        });
        this.attributes.length = 0;
        this.attributesContainer = null;
        this.attributes = null;
        this.label = null;
        //this.rtLabel = null;
        this.scene = null;
        super.destroy();
    }
}
//# sourceMappingURL=PhaserUnit.js.map