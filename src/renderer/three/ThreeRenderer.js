/// <reference types="@types/google.analytics" />
var ThreeRenderer = /** @class */ (function () {
    function ThreeRenderer() {
        var _a;
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        (_a = document.querySelector('#game-div')) === null || _a === void 0 ? void 0 : _a.appendChild(renderer.domElement);
        this.renderer = renderer;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 20;
        this.camera.position.z = 20;
        this.camera.lookAt(new THREE.Vector3());
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.scene = new THREE.Scene();
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        var map = new THREE.Group();
        map.translateX(-taro.game.data.map.width / 2);
        map.translateZ(-taro.game.data.map.height / 2);
        this.scene.add(map);
        taro.game.data.map.layers.forEach(function (layer) {
            if (layer.name === 'floor') {
                for (var x = 0; x < layer.width; x++) {
                    for (var z = 0; z < layer.height; z++) {
                        var newCube = cube.clone();
                        newCube.position.set(x, 0, z);
                        newCube.material = newCube.material.clone();
                        newCube.material.color.setScalar(layer.data[z * layer.width + x] / 300);
                        map.add(newCube);
                    }
                }
            }
            if (layer.name === 'walls') {
                for (var x = 0; x < layer.width; x++) {
                    for (var z = 0; z < layer.height; z++) {
                        if (layer.data[z * layer.width + x] !== 0) {
                            var newCube = cube.clone();
                            newCube.position.set(x, 1, z);
                            newCube.material = newCube.material.clone();
                            newCube.material.color.setScalar(layer.data[z * layer.width + x] / 300);
                            map.add(newCube);
                        }
                    }
                }
            }
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