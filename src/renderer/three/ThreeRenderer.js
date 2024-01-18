/// <reference types="@types/google.analytics" />
var ThreeRenderer = /** @class */ (function () {
    function ThreeRenderer() {
        var _this = this;
        var _a;
        this.textures = new Map();
        this.units = [];
        this.entities = [];
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        (_a = document.querySelector('#game-div')) === null || _a === void 0 ? void 0 : _a.appendChild(renderer.domElement);
        this.renderer = renderer;
        var width = window.innerWidth;
        var height = window.innerHeight;
        this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
        // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 20;
        this.camera.position.z = 20;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target = new THREE.Vector3(0, 0, 10);
        this.scene = new THREE.Scene();
        THREE.DefaultLoadingManager.onLoad = function () {
            console.log(_this.textures);
            _this.init();
            _this.setupInputListeners();
            taro.client.rendererLoaded.resolve();
            requestAnimationFrame(_this.render.bind(_this));
        };
        this.loadTextures();
    }
    ThreeRenderer.prototype.loadTextures = function () {
        var _this = this;
        var textureLoader = new THREE.TextureLoader();
        var data = taro.game.data;
        data.map.tilesets.forEach(function (tileset) {
            var key = tileset.image;
            var url = Utils.patchAssetUrl(key);
            textureLoader.load(url, function (tex) { return _this.textures.set(key, tex); });
        });
        var _loop_1 = function (type) {
            var cellSheet = data.unitTypes[type].cellSheet;
            if (!cellSheet)
                return "continue";
            var key = cellSheet.url;
            var url = Utils.patchAssetUrl(key);
            textureLoader.load(url, function (tex) { return _this.textures.set(cellSheet.url, tex); });
        };
        for (var type in data.unitTypes) {
            _loop_1(type);
        }
        var _loop_2 = function (type) {
            var cellSheet = data.projectileTypes[type].cellSheet;
            if (!cellSheet)
                return "continue";
            var key = cellSheet.url;
            var url = Utils.patchAssetUrl(key);
            textureLoader.load(url, function (tex) { return _this.textures.set(cellSheet.url, tex); });
        };
        for (var type in data.projectileTypes) {
            _loop_2(type);
        }
        var _loop_3 = function (type) {
            var key = data.particleTypes[type].url;
            var url = Utils.patchAssetUrl(key);
            textureLoader.load(url, function (tex) { return _this.textures.set(key, tex); });
        };
        for (var type in data.particleTypes) {
            _loop_3(type);
        }
    };
    ThreeRenderer.prototype.init = function () {
        var _this = this;
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ transparent: true });
        var cube = new THREE.Mesh(geometry, material);
        taro.game.data.map.tilesets.forEach(function (tileset) {
            var tex = _this.textures.get(tileset.image);
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            cube.material.map = tex;
            cube.material.needsUpdate = true;
            var map = new THREE.Group();
            map.translateX(-taro.game.data.map.width / 2);
            map.translateZ(-taro.game.data.map.height / 2);
            _this.scene.add(map);
            var tileSize = 64;
            var texWidth = tex.image.width;
            var texHeight = tex.image.height;
            var tilesInRow = texWidth / tileSize;
            var xStep = tileSize / texWidth;
            var yStep = tileSize / texHeight;
            taro.game.data.map.layers.forEach(function (layer) {
                if (layer.name === 'floor') {
                    for (var z = 0; z < layer.height; z++) {
                        for (var x = 0; x < layer.width; x++) {
                            var newCube = cube.clone();
                            newCube.position.set(x, 0, z);
                            newCube.material = newCube.material.clone();
                            var tileIdx = layer.data[z * layer.width + x];
                            var xIdx = (tileIdx % tilesInRow) - 1;
                            var yIdx = Math.floor(tileIdx / tilesInRow);
                            newCube.material.map = newCube.material.map.clone();
                            newCube.material.map.repeat.set(tileSize / texWidth, tileSize / texHeight);
                            newCube.material.map.offset.x = xStep * xIdx;
                            newCube.material.map.offset.y = 1 - yStep * yIdx - yStep;
                            map.add(newCube);
                        }
                    }
                }
                if (layer.name === 'walls') {
                    for (var z = 0; z < layer.height; z++) {
                        for (var x = 0; x < layer.width; x++) {
                            if (layer.data[z * layer.width + x] !== 0) {
                                var newCube = cube.clone();
                                newCube.position.set(x, 1, z);
                                newCube.material = newCube.material.clone();
                                var tileIdx = layer.data[z * layer.width + x];
                                var xIdx = (tileIdx % tilesInRow) - 1;
                                var yIdx = Math.floor(tileIdx / tilesInRow);
                                newCube.material.map = newCube.material.map.clone();
                                newCube.material.map.repeat.set(tileSize / texWidth, tileSize / texHeight);
                                newCube.material.map.offset.x = xStep * xIdx;
                                newCube.material.map.offset.y = 1 - yStep * yIdx - yStep;
                                map.add(newCube);
                            }
                        }
                    }
                }
            });
        });
        var entities = new THREE.Group();
        entities.translateX(-taro.game.data.map.width / 2);
        entities.translateZ(-taro.game.data.map.height / 2);
        this.scene.add(entities);
        taro.client.on('create-unit', function (unit) {
            console.log(unit);
            console.log(unit._stats.cellSheet.url);
            unit.on('transform', function (data) {
                unit._translate.x = data.x;
                unit._translate.y = data.y;
            }, _this);
            _this.units.push(unit);
            var newCube = cube.clone();
            newCube.scale.set(0.5, 0.5, 0.5);
            newCube.position.set(unit._translate.x / 64, 2, unit._translate.y / 64);
            newCube.material = newCube.material.clone();
            newCube.material.map = null;
            entities.add(newCube);
            _this.entities.push(newCube);
            _this;
        });
    };
    ThreeRenderer.prototype.setupInputListeners = function () {
        // Ask the input component to set up any listeners it has
        taro.input.setupListeners(this.renderer.domElement);
    };
    ThreeRenderer.prototype.getViewportBounds = function () {
        // return this.scene.getScene('Game').cameras.main.worldView;
        return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    };
    ThreeRenderer.prototype.getCameraWidth = function () {
        // return this.scene.getScene('Game').cameras.main.displayWidth;
        return window.innerWidth;
    };
    ThreeRenderer.prototype.getCameraHeight = function () {
        // return this.scene.getScene('Game').cameras.main.displayHeight;
        return window.innerHeight;
    };
    ThreeRenderer.prototype.render = function () {
        requestAnimationFrame(this.render.bind(this));
        if (this.units.length > 0) {
            for (var i = 0; i < this.units.length; i++) {
                var u = this.units[i];
                this.entities[i].position.set(u._translate.x / 64 - 0.5, 2, u._translate.y / 64 - 0.5);
            }
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        taro.client.emit('tick');
    };
    return ThreeRenderer;
}());
//# sourceMappingURL=ThreeRenderer.js.map