class ThreeCamera {
    constructor(viewportWidth, viewportHeight, canvas) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.target = null;
        this.isPerspective = false;
        const persCamera = new THREE.PerspectiveCamera(75, viewportWidth / viewportHeight, 0.1, 1000);
        persCamera.position.y = 20;
        this.perspectiveCamera = persCamera;
        const halfWidth = frustumWidthAtDistance(this.perspectiveCamera, persCamera.position.y) / 2;
        const halfHeight = frustumHeightAtDistance(this.perspectiveCamera, persCamera.position.y) / 2;
        const orthoCamera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 0.1, 1000);
        orthoCamera.position.y = 20;
        this.orthographicCamera = orthoCamera;
        this.instance = orthoCamera;
        this.controls = new OrbitControls(this.instance, canvas);
        this.controls.enableRotate = false;
        this.controls.mouseButtons = { LEFT: '', MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
        this.controls.update();
        this.orthographicState = {
            target: new THREE.Vector3(),
            position: new THREE.Vector3(),
        };
        this.perspectiveState = {
            target: new THREE.Vector3(),
            position: new THREE.Vector3(),
            zoom: this.controls.zoom,
        };
        window.addEventListener('keypress', (evt) => {
            if (evt.key === 'v') {
                this.isPerspective = !this.isPerspective;
                if (this.isPerspective) {
                    this.switchToPerspectiveCamera();
                }
                else {
                    this.switchToOrthographicCamera();
                }
            }
        });
    }
    update() {
        if (this.controls.enableRotate) {
            this.controls.update();
        }
        if (this.target) {
            const targetWorldPos = new THREE.Vector3();
            this.target.getWorldPosition(targetWorldPos);
            this.setPosition2D(targetWorldPos.x, targetWorldPos.z);
        }
    }
    resize() {
        if (this.instance instanceof THREE.PerspectiveCamera) {
            this.instance.aspect = this.viewportWidth / this.viewportHeight;
            this.instance.updateProjectionMatrix();
        }
        else if (this.instance instanceof THREE.OrthographicCamera) {
            this.instance.left = this.viewportWidth / -2;
            this.instance.right = this.viewportWidth / 2;
            this.instance.top = this.viewportHeight / 2;
            this.instance.bottom = this.viewportHeight / -2;
            this.instance.updateProjectionMatrix();
        }
    }
    startFollow(target) {
        this.target = target;
    }
    stopFollow() {
        this.target = null;
    }
    getWorldPoint(p) {
        let targetY = 0;
        if (this.target) {
            const targetWorldPos = new THREE.Vector3();
            this.target.getWorldPosition(targetWorldPos);
            targetY = targetWorldPos.y;
        }
        const point = p.clone();
        point.unproject(this.instance);
        if (!this.isPerspective) {
            return point;
        }
        point.sub(this.instance.position).normalize();
        var dist = (targetY - this.instance.position.y) / point.y;
        return this.instance.position.clone().add(point.multiplyScalar(dist));
    }
    setPosition2D(x, z) {
        var _a, _b, _c, _d;
        const oldTarget = this.controls.target.clone();
        const target = new THREE.Vector3(x, this.controls.target.y, z);
        const diff = target.clone().sub(oldTarget);
        const t = (((_d = (_c = (_b = (_a = taro === null || taro === void 0 ? void 0 : taro.game) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.settings) === null || _c === void 0 ? void 0 : _c.camera) === null || _d === void 0 ? void 0 : _d.trackingDelay) || 3) / taro.fps();
        this.controls.target.lerp(this.controls.target.clone().add(diff), t);
        this.orthographicCamera.position.lerp(this.orthographicCamera.position.clone().add(diff), t);
        this.perspectiveCamera.position.lerp(this.perspectiveCamera.position.clone().add(diff), t);
    }
    switchToOrthographicCamera() {
        this.controls.enableRotate = false;
        this.perspectiveState.target.copy(this.controls.target);
        this.perspectiveState.position.copy(this.controls.object.position);
        this.perspectiveState.zoom = this.controls.object.zoom;
        const distance = this.perspectiveCamera.position.distanceTo(this.controls.target);
        const halfWidth = frustumWidthAtDistance(this.perspectiveCamera, distance) / 2;
        const halfHeight = frustumHeightAtDistance(this.perspectiveCamera, distance) / 2;
        this.orthographicCamera.top = halfHeight;
        this.orthographicCamera.bottom = -halfHeight;
        this.orthographicCamera.left = -halfWidth;
        this.orthographicCamera.right = halfWidth;
        this.orthographicCamera.zoom = 1; // don't touch. makes sure camera seamless transition between pers/ortho when zoomed.
        this.orthographicCamera.lookAt(this.controls.target);
        this.orthographicCamera.updateProjectionMatrix();
        this.instance = this.orthographicCamera;
        this.controls.object = this.orthographicCamera;
        if (this.orthographicState.target && this.orthographicState.position) {
            this.controls.target.copy(this.orthographicState.target);
            this.controls.object.position.copy(this.orthographicState.position).divideScalar(this.orthographicCamera.zoom);
            this.controls.update();
        }
    }
    switchToPerspectiveCamera() {
        this.controls.enableRotate = true;
        this.orthographicState.target.copy(this.controls.target);
        this.orthographicState.position.copy(this.controls.object.position);
        this.perspectiveCamera.updateProjectionMatrix();
        this.instance = this.perspectiveCamera;
        this.controls.object = this.perspectiveCamera;
        if (this.perspectiveState.target && this.perspectiveState.position && this.perspectiveState.zoom) {
            this.controls.target.copy(this.perspectiveState.target);
            this.controls.object.position.copy(this.perspectiveState.position).divideScalar(this.orthographicCamera.zoom);
            this.controls.object.zoom = this.perspectiveState.zoom;
            this.controls.update();
        }
    }
}
function frustumHeightAtDistance(camera, distance) {
    // Fov formula: http://www.artdecocameras.com/resources/angle-of-view/
    const angle = (camera.fov * Math.PI) / 180; // camera.fov is vertical fov.
    return Math.tan(angle / 2) * distance * 2;
}
function frustumWidthAtDistance(camera, distance) {
    return frustumHeightAtDistance(camera, distance) * camera.aspect;
}
//# sourceMappingURL=ThreeCamera.js.map