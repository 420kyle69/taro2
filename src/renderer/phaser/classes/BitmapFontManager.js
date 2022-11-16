var BitmapFontManager = /** @class */ (function () {
    function BitmapFontManager() {
    }
    BitmapFontManager.preload = function (scene) {
        scene.load.bitmapFont('ArialBold#FFFFFF', '/assets/fonts/ArialBold.png', '/assets/fonts/ArialBold.xml');
    };
    BitmapFontManager.create = function (scene) {
        this.add(scene, 'Arial', true, '#000000');
    };
    BitmapFontManager.font = function (scene, font, bold, color) {
        var key = font +
            (bold ? 'Bold' : '') +
            color.toUpperCase();
        if (!scene.cache.bitmapFont.has(key)) {
            this.add(scene, font, bold, color);
        }
        return key;
    };
    BitmapFontManager.add = function (scene, font, bold, color) {
        var key = font +
            (bold ? 'Bold' : '') +
            color.toUpperCase();
        var sourceFillKey = "".concat(font +
            (bold ? 'Bold' : ''), "#FFFFFF");
        var bitmapCache = scene.cache.bitmapFont;
        var textures = scene.textures;
        var sourceFillData = bitmapCache.get(sourceFillKey);
        var sourceFillTexture = textures.get(sourceFillData.texture);
        var sourceFillImage = sourceFillTexture
            .getSourceImage();
        var w = sourceFillImage.width;
        var h = sourceFillImage.height;
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(sourceFillImage, 0, 0, w, h);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over'; // default
        textures.addCanvas(key, canvas);
        bitmapCache.add(key, {
            data: sourceFillData.data,
            frame: null,
            texture: key
        });
    };
    return BitmapFontManager;
}());
//# sourceMappingURL=BitmapFontManager.js.map