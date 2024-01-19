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
            const map = new THREE.Group();
            map.translateX(-taro.game.data.map.width / 2);
            map.translateZ(-taro.game.data.map.height / 2);
            this.scene.add(map);
            const tileSize = 64;
            const texWidth = tex.image.width;
            const texHeight = tex.image.height;
            const tilesInRow = texWidth / tileSize;
            const xStep = tileSize / texWidth;
            const yStep = tileSize / texHeight;
            taro.game.data.map.layers.forEach((layer) => {
                if (layer.name === 'floor') {
                    for (let z = 0; z < layer.height; z++) {
                        for (let x = 0; x < layer.width; x++) {
                            const newCube = cube.clone();
                            newCube.position.set(x, 0, z);
                            newCube.material = newCube.material.clone();
                            const tileIdx = layer.data[z * layer.width + x];
                            const xIdx = (tileIdx % tilesInRow) - 1;
                            const yIdx = Math.floor(tileIdx / tilesInRow);
                            newCube.material.map = newCube.material.map.clone();
                            newCube.material.map.repeat.set(tileSize / texWidth, tileSize / texHeight);
                            newCube.material.map.offset.x = xStep * xIdx;
                            newCube.material.map.offset.y = 1 - yStep * yIdx - yStep;
                            map.add(newCube);
                        }
                    }
                }
                if (layer.name === 'walls') {
                    for (let z = 0; z < layer.height; z++) {
                        for (let x = 0; x < layer.width; x++) {
                            if (layer.data[z * layer.width + x] !== 0) {
                                const newCube = cube.clone();
                                newCube.position.set(x, 1, z);
                                newCube.material = newCube.material.clone();
                                const tileIdx = layer.data[z * layer.width + x];
                                const xIdx = (tileIdx % tilesInRow) - 1;
                                const yIdx = Math.floor(tileIdx / tilesInRow);
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
        const entities = new THREE.Group();
        entities.translateX(-taro.game.data.map.width / 2);
        entities.translateZ(-taro.game.data.map.height / 2);
        this.scene.add(entities);
        const createEntity = (entity) => {
            const tex = this.textures.get(entity._stats.cellSheet.url);
            const ent = new Entity(tex, entity);
            entities.add(ent);
            this.entities.push(ent);
            entity.on('transform', (data) => {
                entity._translate.x = data.x;
                entity._translate.y = data.y;
                entity._rotate.z = data.rotation;
            }, this);
            entity.on('size', (data) => {
                entity._scale.x = data.width / 64;
                entity._scale.y = data.height / 64;
            }, this);
            entity.on('follow', () => {
                this.followedEntity = ent;
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
        for (const ent of this.entities) {
            ent.render();
        }
        if (this.followedEntity) {
            const pointer = new THREE.Vector3(this.pointer.x, this.pointer.y, 0.5);
            pointer.unproject(this.camera);
            taro.input.emit('pointermove', [
                {
                    x: (pointer.x + taro.game.data.map.width / 2 + 0.5) * 64,
                    y: (pointer.z + taro.game.data.map.height / 2 + 0.5) * 64,
                },
            ]);
            this.camera.position.set(this.followedEntity.position.x - taro.game.data.map.width / 2, this.camera.position.y, this.followedEntity.position.z - taro.game.data.map.height / 2);
            this.controls.target.set(this.followedEntity.position.x - taro.game.data.map.width / 2, this.controls.target.y, this.followedEntity.position.z - taro.game.data.map.height / 2);
            this.controls.update();
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        taro.client.emit('tick');
    }
}
//# sourceMappingURL=ThreeRenderer.js.map