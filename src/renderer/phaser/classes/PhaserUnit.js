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
        var _this = _super.call(this, scene, entity, "unit/".concat(entity._stats.type)) || this;
        _this.attributes = [];
        var translate = entity._translate;
        var gameObject = scene.add.container(translate.x, translate.y, [_this.sprite]);
        _this.gameObject = gameObject;
        var containerSize = Math.max(_this.sprite.displayHeight, _this.sprite.displayWidth);
        gameObject.setSize(containerSize, containerSize);
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
        console.log(_this.entity);
        _this.scene.unitsList.push(_this);
        _this.scene.renderedEntities.push(_this.gameObject);
        _this.zoomEvtListener = ige.client.on('scale', _this.scaleElements, _this);
        return _this;
    }
    PhaserUnit.prototype.updateTexture = function (usingSkin) {
        if (usingSkin) {
            this.sprite.anims.stop();
            this.key = "unit/".concat(this.entity._stats.cellSheet.url);
            if (!this.scene.textures.exists("unit/".concat(this.entity._stats.cellSheet.url))) {
                this.scene.loadEntity("unit/".concat(this.entity._stats.cellSheet.url), this.entity._stats, true);
                this.scene.load.on("filecomplete-image-".concat(this.key), function cnsl() {
                    if (this && this.sprite) {
                        this.sprite.setTexture("unit/".concat(this.entity._stats.cellSheet.url));
                        this.sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
                        var bounds = this.entity._bounds2d;
                        this.sprite.setDisplaySize(bounds.x, bounds.y);
                    }
                }, this);
                this.scene.load.start();
            }
            else {
                this.sprite.setTexture("unit/".concat(this.entity._stats.cellSheet.url));
                var bounds = this.entity._bounds2d;
                this.sprite.setDisplaySize(bounds.x, bounds.y);
            }
        }
        else {
            this.key = "unit/".concat(this.entity._stats.type);
            this.sprite.setTexture("unit/".concat(this.entity._stats.type));
            var bounds = this.entity._bounds2d;
            this.sprite.setDisplaySize(bounds.x, bounds.y);
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
        var containerSize = Math.max(this.sprite.displayHeight, this.sprite.displayWidth);
        this.gameObject.setSize(containerSize, containerSize);
        if (this.label) {
            this.updateLabelOffset();
        }
        if (this.attributesContainer) {
            this.updateAttributesOffset();
        }
    };
    PhaserUnit.prototype.updateLabelOffset = function () {
        this.label.y = -25 - (this.sprite.displayHeight + this.sprite.displayWidth) / 4;
    };
    PhaserUnit.prototype.updateAttributesOffset = function () {
        this.attributesContainer.y = 25 + (this.sprite.displayHeight + this.sprite.displayWidth) / 4;
    };
    PhaserUnit.prototype.follow = function () {
        var camera = this.scene.cameras.main;
        if (camera._follow === this.gameObject) {
            return;
        }
        camera.startFollow(this.gameObject, false, 0.05, 0.05);
    };
    PhaserUnit.prototype.getLabel = function () {
        if (!this.label) {
            var label = this.label = this.scene.add.text(0, 0, 'cccccc');
            // needs to be created with the correct scale of the client
            this.label.setScale(1 / this.scene.cameras.main.zoom);
            label.setOrigin(0.5);
            this.gameObject.add(label);
        }
        return this.label;
    };
    PhaserUnit.prototype.updateLabel = function (data) {
        var label = this.getLabel();
        label.visible = true;
        label.setFontFamily('Verdana');
        label.setFontSize(16);
        label.setFontStyle(data.bold ? 'bold' : 'normal');
        label.setFill(data.color || '#fff');
        //label.setResolution(4);
        var strokeThickness = ige.game.data.settings
            .addStrokeToNameAndAttributes !== false ? 4 : 0;
        label.setStroke('#000', strokeThickness);
        label.setText(data.text || '');
        this.updateLabelOffset();
    };
    PhaserUnit.prototype.showLabel = function () {
        this.getLabel().visible = true;
    };
    PhaserUnit.prototype.hideLabel = function () {
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
        }
        this.scaleTween = this.scene.tweens.add({
            targets: targets,
            duration: 1000,
            ease: Phaser.Math.Easing.Quadratic.Out,
            scale: targetScale,
            onComplete: function () {
                _this.scaleTween = null;
            }
        });
    };
    PhaserUnit.prototype.destroy = function () {
        var _this = this;
        this.scene.renderedEntities = this.scene.renderedEntities.filter(function (item) { return item !== _this.gameObject; });
        this.scene.unitsList = this.scene.unitsList.filter(function (item) { return item.entity.id() !== _this.entity.id(); });
        ige.client.off('scale', this.zoomEvtListener);
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
        this.scene = null;
        _super.prototype.destroy.call(this);
    };
    return PhaserUnit;
}(PhaserAnimatedEntity));
//# sourceMappingURL=PhaserUnit.js.map