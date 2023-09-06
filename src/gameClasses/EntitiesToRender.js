var EntitiesToRender = /** @class */ (function () {
    function EntitiesToRender() {
        this.trackEntityById = {};
        taro.client.on('tick', this.frameTick, this);
    }
    EntitiesToRender.prototype.updateAllEntities = function ( /*timeStamp*/) {
        var _a, _b, _c, _d, _e;
        for (var entityId in this.trackEntityById) {
            // var timeStart = performance.now();
            // var entity = taro.$(entityId);
            var entity = this.trackEntityById[entityId];
            // taro.profiler.logTimeElapsed('findEntity', timeStart);
            if (entity) {
                // handle entity behaviour and transformation offsets
                // var timeStart = performance.now();
                var phaserEntity = (_a = entity.phaserEntity) === null || _a === void 0 ? void 0 : _a.gameObject;
                if (taro.gameLoopTickHasExecuted) {
                    if (entity._deathTime !== undefined && entity._deathTime <= taro._tickStart) {
                        // Check if the deathCallBack was set
                        if (entity._deathCallBack) {
                            entity._deathCallBack.apply(entity);
                            delete entity._deathCallBack;
                        }
                        entity.destroy();
                    }
                    // if (typeof entity._behaviour == 'function')
                    entity._behaviour();
                }
                var ownerUnit = undefined;
                if (entity._category == 'item') {
                    ownerUnit = entity.getOwnerUnit();
                }
                if (entity.isTransforming()) {
                    entity._processTransform();
                }
                if (entity._translate) {
                    var x = entity._translate.x;
                    var y = entity._translate.y;
                    var rotate = entity._rotate.z;
                }
                // if item is being carried by a unit
                if (ownerUnit) {
                    // if the ownerUnit is not visible, then hide the item
                    if (ownerUnit.phaserEntity && ownerUnit.phaserEntity.gameObject.visible == false) {
                        ownerUnit.phaserEntity.setVisible(false);
                        continue;
                    }
                    // update ownerUnit's transform, so the item can be positioned relative to the ownerUnit's transform
                    ownerUnit._processTransform();
                    // var timeStart = performance.now();
                    // rotate weldjoint items to the owner unit's rotation
                    if (entity._stats.currentBody && entity._stats.currentBody.jointType == 'weldJoint') {
                        rotate = ownerUnit._rotate.z;
                        // immediately rotate my unit's items to the angleToTarget
                    }
                    else if (ownerUnit == taro.client.selectedUnit && ((_c = (_b = entity._stats.controls) === null || _b === void 0 ? void 0 : _b.mouseBehaviour) === null || _c === void 0 ? void 0 : _c.rotateToFaceMouseCursor)) {
                        rotate = ownerUnit.angleToTarget; // angleToTarget is updated at 60fps
                    }
                    entity._rotate.z = rotate; // update the item's rotation immediately for more accurate aiming (instead of 20fps)
                    entity.anchoredOffset = entity.getAnchoredOffset(rotate);
                    if (entity.anchoredOffset) {
                        x = ownerUnit._translate.x + entity.anchoredOffset.x;
                        y = ownerUnit._translate.y + entity.anchoredOffset.y;
                        rotate = entity.anchoredOffset.rotate;
                    }
                }
                if (((_d = entity.tween) === null || _d === void 0 ? void 0 : _d.isTweening) && (phaserEntity === null || phaserEntity === void 0 ? void 0 : phaserEntity.visible)) {
                    entity.tween.update();
                    x += entity.tween.offset.x;
                    y += entity.tween.offset.y;
                    rotate += entity.tween.offset.rotate;
                }
                if (((_e = entity.tween) === null || _e === void 0 ? void 0 : _e.isTweening) ||
                    entity.isTransforming() ||
                    entity == taro.client.selectedUnit ||
                    entity._category == 'item') {
                    // var timeStart = performance.now();
                    entity.transformTexture(x, y, rotate);
                    // taro.profiler.logTimeElapsed('transformTexture', timeStart);
                }
            }
        }
        // taro.triggersQueued = [];
        if (taro.gameLoopTickHasExecuted) {
            taro.gameLoopTickHasExecuted = false;
        }
    };
    EntitiesToRender.prototype.frameTick = function () {
        taro.engineStep(Date.now(), 1000 / 60);
        taro.input.processInputOnEveryFps();
        taro._renderFrames++;
        this.updateAllEntities();
    };
    return EntitiesToRender;
}());
//# sourceMappingURL=EntitiesToRender.js.map