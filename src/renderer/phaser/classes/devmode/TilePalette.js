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
var TilePalette = /** @class */ (function (_super) {
    __extends(TilePalette, _super);
    function TilePalette(scene, tileset, rexUI) {
        var _this = _super.call(this, scene) || this;
        console.log('create palette', _this);
        _this.tileset = tileset;
        _this.rexUI = rexUI;
        _this.scene = scene;
        _this.x = -1000;
        _this.y = 0;
        // Load a map from a 2D array of tile indices
        var paletteMap = [];
        for (var i = 0; i < tileset.rows; i++) {
            paletteMap.push([]);
        }
        for (var i = 0; i < tileset.total; i++) {
            paletteMap[Math.floor(i / tileset.columns)].push(i + 1);
        }
        // When loading from an array, make sure to specify the tileWidth and tileHeight
        var map = _this.map = _this.scene.make.tilemap({ key: 'palette', data: paletteMap, tileWidth: 16, tileHeight: 16 });
        var texturesLayer = _this.texturesLayer = map.createLayer(0, tileset, 0, 0).setOrigin(0, 0).setInteractive().setPosition(_this.x, _this.y);
        scene.add.existing(texturesLayer);
        var paletteWidth = _this.paletteWidth = _this.scene.sys.game.canvas.width * 0.25;
        var paletteHeight = _this.paletteHeight = _this.scene.sys.game.canvas.height * 0.25;
        var camera = _this.camera = _this.scene.cameras.add(_this.scene.sys.game.canvas.width - paletteWidth - 40, _this.scene.sys.game.canvas.height - paletteHeight - 40, paletteWidth, paletteHeight)
            .setBounds(texturesLayer.x - (texturesLayer.width / 2), texturesLayer.y - (texturesLayer.height / 2), texturesLayer.width * 2, texturesLayer.height * 2, true)
            .setZoom(1).setName('palette');
        camera.setBackgroundColor(0xFFFFFF);
        texturesLayer.on('pointermove', function (p) {
            var devModeScene = ige.renderer.scene.getScene('DevMode');
            devModeScene.regionEditor.cancelDrawRegion();
            if (!p.isDown)
                return;
            var scrollX = (p.x - p.prevPosition.x) / camera.zoom;
            var scrollY = (p.y - p.prevPosition.y) / camera.zoom;
            camera.scrollX -= scrollX;
            camera.scrollY -= scrollY;
            var bottomValue = (camera.scrollX - camera.getBounds().x) / (camera.getBounds().width - camera.width);
            var rightValue = (camera.scrollY - camera.getBounds().y) / (camera.getBounds().height - camera.height);
            if (bottomValue > 1)
                bottomValue = 1;
            if (rightValue > 1)
                rightValue = 1;
            if (bottomValue < 0)
                bottomValue = 0;
            if (rightValue < 0)
                rightValue = 0;
            scrollBarBottom.blocked = true;
            scrollBarRight.blocked = true;
            scrollBarBottom.value = bottomValue;
            scrollBarRight.value = rightValue;
            scrollBarBottom.blocked = false;
            scrollBarRight.blocked = false;
        });
        _this.COLOR_PRIMARY = 0x0036cc;
        _this.COLOR_LIGHT = 0x6690ff;
        _this.COLOR_DARK = 0xffffff;
        var scrollBarContainer = _this.scrollBarContainer = new Phaser.GameObjects.Container(scene);
        scene.add.existing(scrollBarContainer);
        scrollBarContainer.x = camera.x;
        scrollBarContainer.y = camera.y;
        var scrollBarBottom = _this.scrollBarBottom = _this.addScrollBar('x');
        var scrollBarRight = _this.scrollBarRight = _this.addScrollBar('y');
        scrollBarContainer.width = camera.width + scrollBarRight.width + 60;
        scrollBarContainer.height = camera.height + scrollBarBottom.height + 60;
        _this.scene.scale.on(Phaser.Scale.Events.RESIZE, function () {
            camera.x = _this.scene.sys.game.canvas.width - paletteWidth - 40;
            scrollBarContainer.x = _this.camera.x;
        });
        return _this;
    }
    TilePalette.prototype.toggle = function () {
        if (this.visible)
            this.hide();
        else
            this.show();
    };
    TilePalette.prototype.hide = function () {
        this.setVisible(false);
        this.texturesLayer.setVisible(false);
        this.camera.setVisible(false);
        this.scrollBarContainer.setVisible(false);
    };
    TilePalette.prototype.show = function () {
        this.setVisible(true);
        this.texturesLayer.setVisible(true);
        this.camera.setVisible(true);
        this.scrollBarContainer.setVisible(true);
    };
    TilePalette.prototype.zoom = function (deltaY) {
        var targetZoom;
        if (deltaY < 0)
            targetZoom = this.camera.zoom * 1.2;
        else
            targetZoom = this.camera.zoom / 1.2;
        if (targetZoom < 0.5)
            targetZoom = 0.5;
        else if (targetZoom > 20)
            targetZoom = 20;
        this.camera.setZoom(targetZoom);
        this.scrollBarBottom.getElement('slider.thumb').width = (this.camera.width - 60) / (targetZoom * 2);
        this.scrollBarBottom.layout();
        this.scrollBarRight.getElement('slider.thumb').height = (this.camera.height - 60) / (targetZoom * 2);
        this.scrollBarRight.layout();
    };
    TilePalette.prototype.addScrollBar = function (orient) {
        var _a;
        var orientSize;
        var length;
        var thumbWidth;
        var thumbHeight;
        var posX = 0;
        var posY = 0;
        if (orient === 'x') {
            orientSize = 'width';
            length = this.camera.width;
            thumbWidth = (length - 60) / 2;
            thumbHeight = 20;
            posY = this.camera.height;
        }
        else if (orient === 'y') {
            orientSize = 'height';
            length = this.camera.height;
            thumbWidth = 20;
            thumbHeight = (length - 60) / 2;
            posX = this.camera.width;
        }
        var scrollBar = this.rexUI.add.scrollBar((_a = {},
            _a[orientSize] = length,
            _a.orientation = orient,
            _a.background = this.rexUI.add.roundRectangle(0, 0, 0, 0, 0, this.COLOR_DARK),
            _a.buttons = {
                left: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, this.COLOR_PRIMARY),
                right: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, this.COLOR_PRIMARY),
            },
            _a.slider = {
                thumb: this.rexUI.add.roundRectangle(0, 0, thumbWidth, thumbHeight, 1, this.COLOR_LIGHT),
            },
            _a.space = {
                left: 1, right: 1, top: 1, bottom: 1
            },
            _a));
        scrollBar.value = 0.5;
        this.scrollBarContainer.add(scrollBar);
        scrollBar.setPosition(posX, posY).setOrigin(0, 0).setScrollFactor(0, 0).layout();
        scrollBar.on('valuechange', function (newValue, oldValue, scrollBar) {
            if (!isNaN(newValue) && !scrollBar.blocked) {
                newValue -= 0.5;
                if (orient === 'x')
                    this.camera.scrollX = this.x + (this.camera.width * newValue);
                else if (orient === 'y')
                    this.camera.scrollY = this.y + (this.camera.height * newValue);
            }
        }, this);
        return scrollBar;
    };
    return TilePalette;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=TilePalette.js.map