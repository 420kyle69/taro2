/// <reference types="@types/google.analytics" />
class ThreeRenderer {
    constructor() {
        var _a;
        this.textures = new Map();
        this.entities = [];
        this.pointer = new THREE.Vector2();
        this.followedEntity = null;
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        (_a = document.querySelector('#game-div')) === null || _a === void 0 ? void 0 : _a.appendChild(renderer.domElement);
        this.renderer = renderer;
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
        // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 20;
        this.camera.position.z = 20;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target = new THREE.Vector3(0, 0, 10);
        this.scene = new THREE.Scene();
        this.scene.translateX(-taro.game.data.map.width / 2);
        this.scene.translateZ(-taro.game.data.map.height / 2);
        THREE.DefaultLoadingManager.onLoad = () => {
            console.log(this.textures);
            this.init();
            this.setupInputListeners();
            taro.client.rendererLoaded.resolve();
            requestAnimationFrame(this.render.bind(this));
        };
        this.loadTextures();
    }
    loadTextures() {
        const textureLoader = new THREE.TextureLoader();
        const data = taro.game.data;
        data.map.tilesets.forEach((tileset) => {
            const key = tileset.image;
            const url = Utils.patchAssetUrl(key);
            textureLoader.load(url, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                this.textures.set(key, tex);
            });
        });
        for (let type in data.unitTypes) {
            const cellSheet = data.unitTypes[type].cellSheet;
            if (!cellSheet)
                continue;
            const key = cellSheet.url;
            const url = Utils.patchAssetUrl(key);
            textureLoader.load(url, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                this.textures.set(key, tex);
            });
        }
        for (let type in data.projectileTypes) {
            const cellSheet = data.projectileTypes[type].cellSheet;
            if (!cellSheet)
                continue;
            const key = cellSheet.url;
            const url = Utils.patchAssetUrl(key);
            textureLoader.load(url, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                this.textures.set(key, tex);
            });
        }
        for (let type in data.itemTypes) {
            const cellSheet = data.itemTypes[type].cellSheet;
            if (!cellSheet)
                continue;
            const key = cellSheet.url;
            const url = Utils.patchAssetUrl(key);
            textureLoader.load(url, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                this.textures.set(key, tex);
            });
        }
        for (let type in data.particleTypes) {
            const key = data.particleTypes[type].url;
            const url = Utils.patchAssetUrl(key);
            textureLoader.load(url, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                this.textures.set(key, tex);
            });
        }
    }
    init() {
        const layers = {
            floor: new THREE.Group(),
            walls: new THREE.Group(),
            entities: new THREE.Group(),
        };
        layers.walls.position.y = 1;
        layers.entities.position.y = 1;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ transparent: true });
        const cube = new THREE.Mesh(geometry, material);
        taro.game.data.map.tilesets.forEach((tileset) => {
            const tex = this.textures.get(tileset.image);
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            cube.material.map = tex;
            cube.material.needsUpdate = true;
            for (const layer of Object.values(layers)) {
                this.scene.add(layer);
            }
            const tileSize = 64;
            const texWidth = tex.image.width;
            const texHeight = tex.image.height;
            const tilesInRow = texWidth / tileSize;
            const xStep = tileSize / texWidth;
            const yStep = tileSize / texHeight;
            // Create map class
            const createCube = (tile) => {
                const newCube = cube.clone();
                newCube.material = newCube.material.clone();
                const xIdx = (tile % tilesInRow) - 1;
                const yIdx = Math.floor(tile / tilesInRow);
                newCube.material.map = newCube.material.map.clone();
                newCube.material.map.repeat.set(tileSize / texWidth, tileSize / texHeight);
                newCube.material.map.offset.x = xStep * xIdx;
                newCube.material.map.offset.y = 1 - yStep * yIdx - yStep;
                return newCube;
            };
            taro.game.data.map.layers.forEach((layer) => {
                if (['floor', 'walls'].includes(layer.name)) {
                    for (let z = 0; z < layer.height; z++) {
                        for (let x = 0; x < layer.width; x++) {
                            const cube = createCube(layer.data[z * layer.width + x]);
                            cube.position.set(x, 0, z);
                            layers[layer.name].add(cube);
                        }
                    }
                }
            });
        });
        const createEntity = (entity) => {
            const tex = this.textures.get(entity._stats.cellSheet.url);
            const ent = new Entity(tex);
            layers.entities.add(ent);
            this.entities.push(ent);
            const transformEvtListener = entity.on('transform', (data) => {
                ent.position.set(data.x / 64 - 0.5, 1, data.y / 64 - 0.5);
                ent.rotation.y = -data.rotation;
            }, this);
            const sizeEvtListener = entity.on('size', (data) => {
                ent.mesh.scale.set(data.width / 64, 1, data.height / 64);
            }, this);
            const scaleEvtListener = entity.on('scale', (data) => {
                ent.scale.set(data.x, 1, data.y);
            }, this);
            const followEvtListener = entity.on('follow', () => {
                this.followedEntity = ent;
            }, this);
            const destroyEvtListener = entity.on('destroy', () => {
                const idx = this.entities.indexOf(ent, 0);
                if (idx > -1) {
                    layers.entities.remove(ent);
                    this.entities.splice(idx, 1);
                    // Why do I have to call this on the client on destroy?
                    // Does the server not auto cleanup event emitters?
                    entity.off('transform', transformEvtListener);
                    entity.off('size', sizeEvtListener);
                    entity.off('scale', scaleEvtListener);
                    entity.off('follow', followEvtListener);
                    entity.off('destroy', destroyEvtListener);
                }
            }, this);
        };
        taro.client.on('create-unit', (u) => createEntity(u), this);
        taro.client.on('create-item', (i) => createEntity(i), this);
        taro.client.on('create-projectile', (p) => createEntity(p), this);
        this.renderer.domElement.addEventListener('mousemove', (evt) => {
            this.pointer.set((evt.clientX / window.innerWidth) * 2 - 1, -(evt.clientY / window.innerHeight) * 2 + 1);
        });
    }
    setupInputListeners() {
        // Ask the input component to set up any listeners it has
        taro.input.setupListeners(this.renderer.domElement);
    }
    getViewportBounds() {
        // return this.scene.getScene('Game').cameras.main.worldView;
        return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    }
    getCameraWidth() {
        // return this.scene.getScene('Game').cameras.main.displayWidth;
        return window.innerWidth;
    }
    getCameraHeight() {
        // return this.scene.getScene('Game').cameras.main.displayHeight;
        return window.innerHeight;
    }
    render() {
        requestAnimationFrame(this.render.bind(this));
        taro.client.emit('tick');
        if (this.followedEntity) {
            const pointer = new THREE.Vector3(this.pointer.x, this.pointer.y, 0.5);
            pointer.unproject(this.camera);
            taro.input.emit('pointermove', [
                {
                    x: (pointer.x + taro.game.data.map.width / 2 + 0.5) * 64,
                    y: (pointer.z + taro.game.data.map.height / 2 + 0.5) * 64,
                },
            ]);
            const followedEntityWorldPos = new THREE.Vector3();
            this.followedEntity.getWorldPosition(followedEntityWorldPos);
            this.camera.position.set(followedEntityWorldPos.x, this.camera.position.y, followedEntityWorldPos.z);
            this.controls.target.set(followedEntityWorldPos.x, this.controls.target.y, followedEntityWorldPos.z);
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
//# sourceMappingURL=ThreeRenderer.js.map