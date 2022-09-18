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
var PhaserPalette = /** @class */ (function (_super) {
    __extends(PhaserPalette, _super);
    function PhaserPalette(scene, tileset, rexUI) {
        var _this = _super.call(this, scene) || this;
        console.log('create palette', _this);
        _this.tileset = tileset;
        _this.rexUI = rexUI;
        //this.setScrollFactor(0,0);
        _this.x = -1000;
        _this.y = 0;
        // Load a map from a 2D array of tile indices
        var paletteMap = [];
        for (var i = 0; i < tileset.rows; i++) {
            paletteMap.push([]);
        }
        for (var i = 0; i < tileset.total; i++) {
            paletteMap[Math.floor(i / tileset.columns)].push(i);
        }
        console.log('map', paletteMap);
        // When loading from an array, make sure to specify the tileWidth and tileHeight
        var map = _this.map = _this.scene.make.tilemap({ key: 'palette', data: paletteMap, tileWidth: 16, tileHeight: 16 });
        var texturesLayer = _this.texturesLayer = map.createLayer(0, tileset, 0, 0).setOrigin(0, 0).setInteractive() /*.setScrollFactor(0,0)*/.setPosition(_this.x, _this.y);
        //this.add(texturesLayer);
        scene.add.existing(texturesLayer);
        /*texturesLayer.on('pointerover', () => {
            this.pointerOver;
        });*/
        //  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
        var camera = _this.camera = _this.scene.cameras.add(1200, 100, texturesLayer.width, texturesLayer.height).setScroll(_this.x, _this.y).setZoom(1).setName('palette');
        camera.setBackgroundColor(0x002244);
        /*const background = this.background = scene.add.graphics();
        this.add(background);
        scene.add.existing(this);*/
        //this.drawBackground();
        /*this.scene.input.setDraggable(texturesLayer);
        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            console.log('drag', dragX, dragY);
            this.camera.scrollX = dragX;
            this.camera.scrollY = dragY;
        });*/
        var COLOR_PRIMARY = 0x4e342e;
        var COLOR_LIGHT = 0x7b5e57;
        var COLOR_DARK = 0x260e04;
        var scrollBarContainer = _this.scrollBarContainer = new Phaser.GameObjects.Container(scene);
        scene.add.existing(scrollBarContainer);
        scrollBarContainer.x = _this.camera.x;
        scrollBarContainer.y = _this.camera.y;
        var scrollBarBottom = _this.scrollBarBottom = _this.rexUI.add.scrollBar({
            width: _this.camera.width,
            orientation: 'x',
            background: _this.rexUI.add.roundRectangle(0, 0, 0, 0, 0, COLOR_DARK),
            buttons: {
                left: _this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
                right: _this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
            },
            slider: {
                thumb: _this.rexUI.add.roundRectangle(0, 0, (_this.camera.width - 60) / 2, 20, 10, COLOR_LIGHT),
            },
            space: {
                left: 10, right: 10, top: 10, bottom: 10
            }
        });
        scrollBarBottom.value = 0.5;
        _this.scrollBarContainer.add(scrollBarBottom);
        scrollBarBottom.setPosition(0, _this.camera.height).setOrigin(0, 0).setScrollFactor(0, 0).layout();
        var scrollBarRight = _this.scrollBarRight = _this.rexUI.add.scrollBar({
            height: _this.camera.height,
            orientation: 'y',
            background: _this.rexUI.add.roundRectangle(0, 0, 0, 0, 0, COLOR_DARK),
            buttons: {
                left: _this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
                right: _this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_PRIMARY),
            },
            slider: {
                thumb: _this.rexUI.add.roundRectangle(0, 0, 20, (_this.camera.height - 60) / 2, 10, COLOR_LIGHT),
            },
            space: {
                left: 10, right: 10, top: 10, bottom: 10
            }
        });
        scrollBarRight.value = 0.5;
        _this.scrollBarContainer.add(scrollBarRight);
        scrollBarRight.setPosition(_this.camera.width, 0).setOrigin(0, 0).setScrollFactor(0, 0).layout();
        scrollBarContainer.width = camera.width + scrollBarRight.width + 60;
        scrollBarContainer.height = camera.height + scrollBarBottom.height + 60;
        console.log('scrollBarContainer', camera.width, scrollBarRight);
        scrollBarBottom.on('valuechange', function (newValue, oldValue, scrollBar) {
            if (!isNaN(newValue)) {
                newValue -= 0.5;
                camera.scrollX = this.x + (camera.width * newValue);
            }
            //console.log('value', newValue);
            //newValue -= 0.5;
            //const targetValue = newValue * (camera.zoom - 1);
            //scrollBar.value = 0.5 + targetValue;
            //camera.scrollX = this.x /*- (camera.width / 2)*/ + (camera.width * newValue);
        }, _this);
        scrollBarRight.on('valuechange', function (newValue, oldValue, scrollBar) {
            if (!isNaN(newValue)) {
                newValue -= 0.5;
                camera.scrollY = this.y + (camera.height * newValue);
            }
            //console.log('value', newValue);
            //newValue -= 0.5;
            //const targetValue = newValue * (camera.zoom - 1);
            //scrollBar.value = 0.5 + targetValue;
            //console.log('targetValue', targetValue);
            //camera.scrollY = this.y /*- (camera.height / 2)*/ + (camera.height * newValue);
        }, _this);
        return _this;
    }
    /*private drawBackground (): void {
        const background = this.background;

        const width = 570;
        const height = 420;
        background.fillStyle(0x000000, 0.2);
        background.fillRect(
            -10,
            -10,
            width,
            height
        );
    }*/
    PhaserPalette.prototype.zoom = function (pointer, deltaY) {
        var targetZoom;
        if (deltaY < 0)
            targetZoom = this.camera.zoom * 1.2;
        else
            targetZoom = this.camera.zoom / 1.2;
        if (targetZoom < 1)
            targetZoom = 1;
        else if (targetZoom > 20)
            targetZoom = 20;
        this.camera.setZoom(targetZoom);
        /*const targetPosition = this.camera.getWorldPoint(pointer.x, pointer.y);
        this.camera.setScroll(targetPosition.x, targetPosition.y);*/
        this.scrollBarBottom.getElement('slider.thumb').width = (this.camera.width - 60) / (targetZoom * 2);
        //if (targetZoom === 1) this.scrollBarBottom.value = 0.5;
        //if (deltaY > 0) this.scrollBarBottom.value = 0.5 * ((this.scrollBarBottom.value - 0.5) * (targetZoom - 1));
        this.scrollBarBottom.layout();
        this.scrollBarRight.getElement('slider.thumb').height = (this.camera.height - 60) / (targetZoom * 2);
        //if (targetZoom === 1) this.scrollBarRight.value = 0.5;
        this.scrollBarRight.layout();
    };
    return PhaserPalette;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=PhaserPalette.js.map