/// <reference types="@types/google.analytics" />
// Isn't it better for the renderer to have no concept of units, projectiles, etc?
// The renderer only needs to know about things like map, sprites, labels, bars, models
// in some hierarchical manner so labels stick to certain sprites.
// And in the case of projectiles, those are just sprites with a lifetime.
// And on the server side, they shouldn't send events on the entities themselves.
// Instead send an entity ID on creation and refer to it in other events that
// require certain entities (e.g. for updating them). This allows for a more
// flat code architecture and makes it more flexible. For instance if you want
// to delete 100 entites, you now need to send 100 destroy messages to those
// entities. Instead you can send one message with 100 entity ID's. (a lot of
// assumtions here, figure out how it actually works).
// I want to spawn:
// Sprite
// Animated Sprite (in my case the texture is animated via offsets... Animated Texture?)
// Mesh
//  BoxMesh
class ThreeRenderer {
    constructor() {
        var _a;
        this.animations = new Map();
        this.entities = [];
        this.pointer = new THREE.Vector2();
        this.followedEntity = null;
        this.animatedSprites = [];
        const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        (_a = document.querySelector('#game-div')) === null || _a === void 0 ? void 0 : _a.appendChild(renderer.domElement);
        this.renderer = renderer;
        // const width = window.innerWidth;
        // const height = window.innerHeight;
        // this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 20;
        this.camera.position.z = 20;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target = new THREE.Vector3(0, 0, 10);
        // this.controls.enableRotate = false;
        this.scene = new THREE.Scene();
        this.scene.translateX(-taro.game.data.map.width / 2);
        this.scene.translateZ(-taro.game.data.map.height / 2);
        THREE.DefaultLoadingManager.onStart = () => {
            this.forceLoadUnusedCSSFonts();
        };
        THREE.DefaultLoadingManager.onLoad = () => {
            console.log(ThreeTextureManager.instance().textureMap);
            this.init();
            this.setupInputListeners();
            taro.client.rendererLoaded.resolve();
            requestAnimationFrame(this.render.bind(this));
        };
        this.loadTextures();
    }
    loadTextures() {
        const data = taro.game.data;
        data.map.tilesets.forEach((tileset) => {
            const key = tileset.image;
            ThreeTextureManager.instance().loadFromUrl(key, Utils.patchAssetUrl(key));
        });
        const entityTypes = [
            ...Object.values(data.unitTypes),
            ...Object.values(data.projectileTypes),
            ...Object.values(data.itemTypes),
        ];
        for (const type of entityTypes) {
            const cellSheet = type.cellSheet;
            if (!cellSheet)
                continue;
            const key = cellSheet.url;
            ThreeTextureManager.instance().loadFromUrl(key, Utils.patchAssetUrl(key));
        }
        for (const type of Object.values(data.particleTypes)) {
            const key = type.url;
            ThreeTextureManager.instance().loadFromUrl(key, Utils.patchAssetUrl(key));
        }
    }
    forceLoadUnusedCSSFonts() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = 'normal 4px Verdana';
        ctx.fillText('text', 0, 8);
        ctx.font = 'bold 4px Verdana';
        ctx.fillText('text', 0, 8);
    }
    init() {
        const layers = {
            entities: new THREE.Group(),
        };
        layers.entities.position.y = 1;
        for (const layer of Object.values(layers)) {
            this.scene.add(layer);
        }
        taro.game.data.map.tilesets.forEach((tileset) => {
            const tex = ThreeTextureManager.instance().textureMap.get(tileset.image);
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            taro.game.data.map.layers.forEach((layer) => {
                // if (['floor', 'walls'].includes(layer.name)) {
                if (['floor'].includes(layer.name)) {
                    const voxelLayer = new ThreeVoxelLayer(tex, layer);
                    this.scene.add(voxelLayer);
                }
            });
        });
        for (let type in taro.game.data.projectileTypes) {
            const cellSheet = taro.game.data.projectileTypes[type].cellSheet;
            if (!cellSheet)
                continue;
            const key = cellSheet.url;
            const tex = ThreeTextureManager.instance().textureMap.get(key);
            tex.userData.numColumns = cellSheet.columnCount || 1;
            tex.userData.numRows = cellSheet.rowCount || 1;
            tex.userData.key = key;
            // Add animations
            for (let animationsKey in taro.game.data.projectileTypes[type].animations) {
                console.log(key);
                const animation = taro.game.data.projectileTypes[type].animations[animationsKey];
                const frames = animation.frames;
                const animationFrames = [];
                // Correction for 0-based indexing
                for (let i = 0; i < frames.length; i++) {
                    animationFrames.push(frames[i] - 1);
                }
                // Avoid crash by giving it frame 0 if no frame data provided
                if (animationFrames.length === 0) {
                    animationFrames.push(0);
                }
                if (this.animations.has(`${key}/${animationsKey}`)) {
                    this.animations.delete(`${key}/${animationsKey}`);
                }
                this.animations.set(`${key}/${animationsKey}`, {
                    frames: animationFrames,
                    fps: animation.framesPerSecond || 15,
                    repeat: animation.loopCount - 1, // correction for loop/repeat values
                });
            }
        }
        const createEntity = (entity) => {
            const tex = ThreeTextureManager.instance().textureMap.get(entity._stats.cellSheet.url);
            const createEntity = () => {
                // TODO: Make all entities sprites, not a 3D mesh. Only the map is 3D?
                // Uhm what about furniture? They need to be 3D but we don't have proper
                // models for them yet.
                if (entity instanceof Unit) {
                    const e = new ThreeUnit(tex.clone());
                    this.animatedSprites.push(e);
                    return e;
                }
                else if (entity instanceof Projectile) {
                    const e = new ThreeUnit(tex.clone());
                    this.animatedSprites.push(e);
                    return e;
                }
                return new Entity(tex);
            };
            const ent = createEntity();
            layers.entities.add(ent);
            this.entities.push(ent);
            const transformEvtListener = entity.on('transform', (data) => {
                ent.position.set(data.x / 64 - 0.5, 0, data.y / 64 - 0.5);
                ent.rotation.y = -data.rotation;
            }, this);
            const sizeEvtListener = entity.on('size', (data) => {
                var _a;
                ent.mesh.scale.set(data.width / 64, data.height / 64, data.height / 64);
                (_a = ent.sprite) === null || _a === void 0 ? void 0 : _a.scale.set(data.width / 64, data.height / 64);
            }, this);
            const scaleEvtListener = entity.on('scale', (data) => {
                ent.scale.set(data.x, 1, data.y);
            }, this);
            const showEvtListener = entity.on('show', () => {
                ent.visible = true;
            }, this);
            const hideEvtListener = entity.on('hide', () => {
                ent.visible = false;
            }, this);
            const followEvtListener = entity.on('follow', () => {
                this.followedEntity = ent;
            }, this);
            // Label
            const updateLabelEvtListener = entity.on('update-label', (data) => {
                ent.showLabel();
                ent.updateLabel(data);
            });
            const showLabelEvtListener = entity.on('show-label', () => {
                ent.showLabel();
            });
            const hideLabelEvtListener = entity.on('hide-label', () => {
                ent.hideLabel();
            });
            // Attributes
            const renderAttributesEvtListener = entity.on('render-attributes', (data) => {
                ent.renderAttributes(data);
            });
            const updateAttributeEvtListener = entity.on('update-attribute', (data) => {
                ent.updateAttribute(data);
            });
            const renderChatBubbleEvtListener = entity.on('render-chat-bubble', (text) => {
                ent.renderChat(text);
            });
            // Animation
            const playAnimationEvtListener = entity.on('play-animation', (id) => {
                if (entity instanceof Projectile) {
                    const animation = this.animations.get(`${tex.userData.key}/${id}`);
                    ent.loop(animation.frames, animation.fps, animation.repeat);
                }
            });
            entity.on('layer', (data) => {
                // console.log('layer');
            });
            entity.on('depth', (data) => {
                // console.log('depth');
            });
            entity.on('dynamic', (data) => {
                // console.log('dynamic');
            });
            entity.on('flip', (data) => {
                // console.log('flip');
            });
            const destroyEvtListener = entity.on('destroy', () => {
                const idx = this.entities.indexOf(ent, 0);
                if (idx > -1) {
                    layers.entities.remove(ent);
                    this.entities.splice(idx, 1);
                    const animIdx = this.animatedSprites.indexOf(ent, 0);
                    if (animIdx > -1) {
                        this.animatedSprites.splice(animIdx, 1);
                    }
                    // Why do I have to call this on the client on destroy?
                    // Does the server not auto cleanup event emitters?
                    entity.off('transform', transformEvtListener);
                    entity.off('size', sizeEvtListener);
                    entity.off('scale', scaleEvtListener);
                    entity.off('show', showEvtListener);
                    entity.off('hide', hideEvtListener);
                    entity.off('follow', followEvtListener);
                    entity.off('destroy', destroyEvtListener);
                    entity.off('update-label', updateLabelEvtListener);
                    entity.off('show-label', showLabelEvtListener);
                    entity.off('hide-label', hideLabelEvtListener);
                    entity.off('render-attributes', renderAttributesEvtListener);
                    entity.off('update-attribute', updateAttributeEvtListener);
                    entity.off('render-chat-bubble', renderChatBubbleEvtListener);
                    entity.off('play-animation', playAnimationEvtListener);
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
            // const followedEntityWorldPos = new THREE.Vector3();
            // this.followedEntity.getWorldPosition(followedEntityWorldPos);
            // this.camera.position.set(followedEntityWorldPos.x, this.camera.position.y, followedEntityWorldPos.z);
            // this.controls.target.set(followedEntityWorldPos.x, this.controls.target.y, followedEntityWorldPos.z);
        }
        for (const sprite of this.animatedSprites) {
            sprite.update(1 / 60);
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
//# sourceMappingURL=ThreeRenderer.js.map