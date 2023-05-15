var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PhaserUnit = /** @class */ (function (_super) {
    __extends(PhaserUnit, _super);
    function PhaserUnit(scene, entity) {
        var _this = _super.call(this, scene, entity, "unit/".concat(entity._stats.cellSheet.url)) || this;
        _this.attributes = [];
        var translate = entity._translate;
        var gameObject = scene.add.container(translate.x, translate.y, [_this.sprite]);
        _this.gameObject = gameObject;
        _this.updateGameObjectSize();
        // this is hbz-index logic but could be useful for other container operations
        _this.gameObject.spriteHeight2 = _this.sprite.displayHeight / 2;
        Object.assign(_this.evtListeners, {
            follow: entity.on('follow', _this.follow, _this),
            'update-texture': entity.on('update-texture', _this.updateTexture, _this),
            'update-label': entity.on('update-label', _this.updateLabel, _this),
            'show-label': entity.on('show-label', _this.showLabel, _this),
            'hide-label': entity.on('hide-label', _this.hideLabel, _this),
            'fading-text': entity.on('fading-text', _this.fadingText, _this),
            'render-attributes': entity.on('render-attributes', _this.renderAttributes, _this),
            'update-attribute': entity.on('update-attribute', _this.updateAttribute, _this),
            'render-chat-bubble': entity.on('render-chat-bubble', _this.renderChat, _this),
        });
        _this.scene.unitsList.push(_this);
        _this.scene.renderedEntities.push(_this.gameObject);
        _this.zoomEvtListener = taro.client.on('scale', _this.scaleElements, _this);
        _this.sprite.setInteractive();
        _this.sprite.on('pointerdown', function (p) {
            if (taro.developerMode.active && taro.developerMode.activeTab === 'play' && p.rightButtonDown()) {
                if (_this.entity._stats.ownerId && _this.entity._stats.controlledBy === 'human') {
                    console.log('right click on unit, owner of unit: ', _this.entity._stats.ownerId);
                    //this.scene.input.setTopOnly(true);
                    //this.devModeScene.regionEditor.addClickedList({name: this.entity._stats.id, x: stats.x, y: stats.y, width: stats.width, height: stats.height});
                }
            }
        });
        return _this;
    }
    PhaserUnit.prototype.updateTexture = function (data) {
        if (data === 'basic_texture_change') {
            this.sprite.anims.stop();
            this.key = "unit/".concat(this.entity._stats.cellSheet.url);
            if (!this.scene.textures.exists(this.key)) {
                this.scene.loadEntity(this.key, this.entity._stats);
                this.scene.load.on("filecomplete-image-".concat(this.key), function cnsl() {
                    if (this && this.sprite) {
                        this.setTexture(this.key);
                        this.sprite.texture.setFilter(this.scene.filter);
                        var bounds = this.entity._bounds2d;
                        this.sprite.setDisplaySize(bounds.x, bounds.y);
                    }
                }, this);
                this.scene.load.start();
            }
            else {
                this.setTexture(this.key);
                var bounds = this.entity._bounds2d;
                this.sprite.setDisplaySize(bounds.x, bounds.y);
            }
        }
        else if (data === 'using_skin') {
            this.sprite.anims.stop();
            this.key = "unit/".concat(this.entity._stats.cellSheet.url);
            if (!this.scene.textures.exists(this.key)) {
                this.scene.loadEntity(this.key, this.entity._stats);
                this.scene.load.on("filecomplete-image-".concat(this.key), function cnsl() {
                    if (this && this.sprite) {
                        this.setTexture(this.key);
                        this.sprite.texture.setFilter(this.scene.filter);
                        var bounds = this.entity._bounds2d;
                        this.sprite.setDisplaySize(bounds.x, bounds.y);
                    }
                }, this);
                this.scene.load.start();
            }
            else {
                this.setTexture(this.key);
                var bounds = this.entity._bounds2d;
                this.sprite.setDisplaySize(bounds.x, bounds.y);
            }
        }
        else {
            this.key = "unit/".concat(this.entity._stats.cellSheet.url);
            this.setTexture(this.key);
            var bounds = this.entity._bounds2d;
            this.sprite.setDisplaySize(bounds.x, bounds.y);
        }
    };
    PhaserUnit.prototype.depth = function (value) {
        var scene = this.gameObject.scene;
        this.gameObject.taroDepth = value;
        if (scene.heightRenderer) {
            scene.heightRenderer.adjustDepth(this.gameObject);
        }
        else {
            this.gameObject.setDepth(value);
        }
    };
    PhaserUnit.prototype.transform = function (data) {
        _super.prototype.transform.call(this, data);
        if (this.chat) {
            this.chat.updatePosition();
        }
    };
    PhaserUnit.prototype.size = function (data) {
        _super.prototype.size.call(this, data);
        if (data.height) {
            this.gameObject.spriteHeight2 = this.sprite.displayHeight / 2;
        }
        var containerSize = Math.max(this.sprite.displayHeight, this.sprite.displayWidth);
        this.gameObject.setSize(containerSize, containerSize);
        if (this.label) {
            this.updateLabelOffset();
        }
        if (this.attributesContainer) {
            this.updateAttributesOffset();
        }
        this.updateGameObjectSize();
    };
    PhaserUnit.prototype.updateLabelOffset = function () {
        if (this.label) {
            var _a = this.sprite, displayHeight = _a.displayHeight, displayWidth = _a.displayWidth;
            var labelHeight = this.label.getBounds().height;
            this.label.y = -displayHeight / 2 - labelHeight * 1.5;
            /*if (this.rtLabel) {
                this.rtLabel.y = this.label.y;
            }*/
        }
        this.updateGameObjectSize();
    };
    PhaserUnit.prototype.updateAttributesOffset = function () {
        var _a = this.sprite, displayHeight = _a.displayHeight, displayWidth = _a.displayWidth;
        this.attributesContainer.y = (this.attributesContainer.height * this.attributesContainer.scaleX) / 2 + 16 * this.attributesContainer.scaleX + displayHeight / 2;
        this.updateGameObjectSize();
    };
    PhaserUnit.prototype.updateGameObjectSize = function () {
        var containerSize = Math.max(this.sprite.displayHeight, this.sprite.displayWidth);
        var height = containerSize;
        if (this.attributesContainer) {
            height += this.attributesContainer.height;
            height += this.attributesContainer.y;
        }
        if (this.label) {
            height += this.label.height;
            height -= this.label.y;
        }
        this.gameObject.setSize(containerSize, containerSize + height);
    };
    PhaserUnit.prototype.follow = function () {
        var camera = this.scene.cameras.main;
        if (camera._follow === this.gameObject) {
            return;
        }
        this.scene.cameraTarget = this.gameObject;
        if (!taro.developerMode.active || taro.developerMode.activeTab === 'play') {
            camera.startFollow(this.gameObject, false, 0.05, 0.05);
        }
    };
    PhaserUnit.prototype.getLabel = function () {
        if (!this.label) {
            var scene = this.scene;
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
            var label = this.label = scene.add.text(0, 0, 'cccccc');
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
    };
    PhaserUnit.prototype.updateLabel = function (data) {
        var label = this.getLabel();
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
        label.setFill(data.color || '#fff');
        if (this.scene.renderer.type !== Phaser.CANVAS)
            label.setResolution(4);
        var strokeThickness = taro.game.data.settings
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
    };
    PhaserUnit.prototype.showLabel = function () {
        /*const label = this.getLabel();
        const rt = this.rtLabel;

        label.visible = !rt;
        rt && (rt.visible = true);*/
        this.getLabel().visible = true;
    };
    PhaserUnit.prototype.hideLabel = function () {
        /*const label = this.getLabel();
        const rt = this.rtLabel;

        label.visible = false;
        rt && (rt.visible = false);*/
        this.getLabel().visible = false;
    };
    PhaserUnit.prototype.fadingText = function (data) {
        var offset = -25 - Math.max(this.sprite.displayHeight, this.sprite.displayWidth) / 2;
        new PhaserFloatingText(this.scene, {
            text: data.text || '',
            x: this.gameObject.x,
            y: this.gameObject.y + offset,
            color: data.color || '#fff'
        });
    };
    PhaserUnit.prototype.getAttributesContainer = function () {
        if (!this.attributesContainer) {
            this.attributesContainer = this.scene.add.container(0, 0);
            // needs to be created with the correct scale of the client
            this.attributesContainer.setScale(1 / this.scene.cameras.main.zoom);
            this.updateAttributesOffset();
            this.gameObject.add(this.attributesContainer);
        }
        return this.attributesContainer;
    };
    PhaserUnit.prototype.renderAttributes = function (data) {
        var _this = this;
        // creating attributeContainer on the fly,
        // only for units that have attribute bars
        this.getAttributesContainer();
        var attributes = this.attributes;
        // release all existing attribute bars
        attributes.forEach(function (a) {
            PhaserAttributeBar.release(a);
        });
        attributes.length = 0;
        // add attribute bars based on passed data
        data.attrs.forEach(function (ad) {
            var a = PhaserAttributeBar.get(_this);
            a.render(ad);
            attributes.push(a);
        });
    };
    PhaserUnit.prototype.updateAttribute = function (data) {
        var attributes = this.attributes;
        var a;
        var i = 0;
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
    };
    PhaserUnit.prototype.renderChat = function (text) {
        if (this.chat) {
            this.chat.showMessage(text);
        }
        else {
            this.chat = new PhaserChatBubble(this.scene, text, this);
        }
    };
    PhaserUnit.prototype.scaleElements = function (data) {
        var _this = this;
        if (this.scaleTween) {
            this.scaleTween.stop();
            this.scaleTween = null;
        }
        var ratio = data.ratio;
        var targetScale = 1 / ratio;
        var targets = [];
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
            onComplete: function () {
                _this.updateLabelOffset();
                _this.updateAttributesOffset();
                _this.scaleTween = null;
            }
        });
    };
    PhaserUnit.prototype.destroy = function () {
        var _this = this;
        this.scene.renderedEntities = this.scene.renderedEntities.filter(function (item) { return item !== _this.gameObject; });
        this.scene.unitsList = this.scene.unitsList.filter(function (item) { return item.entity.id() !== _this.entity.id(); });
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
        this.attributes.forEach(function (a) {
            PhaserAttributeBar.release(a);
        });
        this.attributes.length = 0;
        this.attributesContainer = null;
        this.attributes = null;
        this.label = null;
        //this.rtLabel = null;
        this.scene = null;
        _super.prototype.destroy.call(this);
    };
    return PhaserUnit;
}(PhaserAnimatedEntity));
//# sourceMappingURL=PhaserUnit.js.map