/// <reference types="@types/google.analytics" />
var ThreeRenderer = /** @class */ (function () {
    function ThreeRenderer() {
        var _a;
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        (_a = document.querySelector('#game-div')) === null || _a === void 0 ? void 0 : _a.appendChild(renderer.domElement);
        this.renderer = renderer;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.scene = new THREE.Scene();
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
        this.cube = cube;
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
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        taro.client.emit('tick');
    };
    return ThreeRenderer;
}());
//# sourceMappingURL=ThreeRenderer.js.map