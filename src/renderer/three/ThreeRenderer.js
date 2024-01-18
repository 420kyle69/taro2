/// <reference types="@types/google.analytics" />
var ThreeRenderer = /** @class */ (function () {
    function ThreeRenderer() {
        var _this = this;
        var _a;
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        (_a = document.querySelector('#game-div')) === null || _a === void 0 ? void 0 : _a.appendChild(renderer.domElement);
        this.renderer = renderer;
        // const width = window.innerHeight;
        // const height = window.innerHeight;
        // this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 20;
        this.camera.position.z = 20;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target = new THREE.Vector3(0, 0, 10);
        this.scene = new THREE.Scene();
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ transparent: true });
        var cube = new THREE.Mesh(geometry, material);
        // get tileset for entities
        // spawn entities
        // update entities transforms
        var textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = 'Anonymous';
        taro.game.data.map.tilesets.forEach(function (tileset) {
            var url = Utils.patchAssetUrl(tileset.image);
            console.log(url);
            textureLoader.load(url, function (tex) {
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
        });
        this.setupInputListeners();
        requestAnimationFrame(this.render.bind(this));
        taro.client.rendererLoaded.resolve();
    }
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
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        taro.client.emit('tick');
    };
    return ThreeRenderer;
}());
//# sourceMappingURL=ThreeRenderer.js.map