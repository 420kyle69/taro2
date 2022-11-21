var BitmapFontManager = /** @class */ (function () {
    function BitmapFontManager() {
    }
    BitmapFontManager.preload = function (scene) {
        var load = scene.load;
        load.bitmapFont('Verdana#FFFFFF', '/assets/fonts/Verdana.png', '/assets/fonts/Verdana.xml');
        load.image('VerdanaStroke#FFFFFF', '/assets/fonts/VerdanaStroke.png');
        load.bitmapFont('VerdanaBold#FFFFFF', '/assets/fonts/VerdanaBold.png', '/assets/fonts/VerdanaBold.xml');
        load.image('VerdanaBoldStroke#FFFFFF', '/assets/fonts/VerdanaBoldStroke.png');
        load.bitmapFont('ArialBold#FFFFFF', '/assets/fonts/ArialBold.png', '/assets/fonts/ArialBold.xml');
    };
    BitmapFontManager.create = function (scene) {
        var bitmapCache = scene.cache.bitmapFont;
        bitmapCache.add('VerdanaStroke#FFFFFF', {
            data: bitmapCache.get('Verdana#FFFFFF').data,
            frame: null,
            texture: 'VerdanaStroke#FFFFFF'
        });
        bitmapCache.add('VerdanaBoldStroke#FFFFFF', {
            data: bitmapCache.get('VerdanaBold#FFFFFF').data,
            frame: null,
            texture: 'VerdanaBoldStroke#FFFFFF'
        });
        this.add(scene, 'Arial', true, false, '#000000');
    };
    BitmapFontManager.font = function (scene, font, bold, stroke, color) {
        var key = font +
            (bold ? 'Bold' : '') +
            (stroke ? 'Stroke' : '') +
            color.toUpperCase();
        if (!scene.cache.bitmapFont.has(key)) {
            this.add(scene, font, bold, stroke, color);
        }
        return key;
    };
    BitmapFontManager.add = function (scene, font, bold, stroke, color) {
        var key = font +
            (bold ? 'Bold' : '') +
            (stroke ? 'Stroke' : '') +
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
        if (stroke) {
            var sourceStrokeKey = "".concat(font +
                (bold ? 'Bold' : '') +
                (stroke ? 'Stroke' : ''), "#FFFFFF");
            var sourceStrokeData = bitmapCache.get(sourceStrokeKey);
            var sourceFillTexture_1 = textures.get(sourceStrokeData.texture);
            var sourceStrokeImage = sourceFillTexture_1
                .getSourceImage();
            var tempCanvas = Phaser.Display.Canvas.CanvasPool
                .create2D(null, w, h);
            var tempCtx = tempCanvas.getContext('2d');
            tempCtx.clearRect(0, 0, w, h);
            tempCtx.drawImage(canvas, 0, 0, w, h);
            ctx.drawImage(sourceStrokeImage, 0, 0, w, h);
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'source-over'; // default
            ctx.drawImage(tempCanvas, 0, 0, w, h);
            Phaser.Display.Canvas.CanvasPool.remove(tempCanvas);
        }
        textures.addCanvas(key, canvas);
        bitmapCache.add(key, {
            data: sourceFillData.data,
            frame: null,
            texture: key
        });
    };
    BitmapFontManager.sanitize = function (fontData, text) {
        for (var i = 0; i < text.length; i++) {
            if (!fontData.chars[text.charCodeAt(i)]) {
                text = text.substring(0, i)
                    + this.REPLACEMENT_CHAR
                    + text.substring(i + 1);
            }
        }
        return text;
    };
    BitmapFontManager.REPLACEMENT_CHAR = String.fromCharCode(65533);
    return BitmapFontManager;
}());
//# sourceMappingURL=BitmapFontManager.js.map