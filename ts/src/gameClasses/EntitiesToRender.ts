class EntitiesToRender {
	trackEntityById: {[key: string]: TaroEntity};
	timeStamp: number;

	constructor() {
		this.trackEntityById = {};
		taro.client.on('tick', this.frameTick, this);
	}

	updateAllEntities (/*timeStamp*/): void {
		for (var entityId in this.trackEntityById) {
			// var timeStart = performance.now();

			// var entity = taro.$(entityId);	
			var entity = this.trackEntityById[entityId];

			// taro.profiler.logTimeElapsed('findEntity', timeStart);
			if (entity) {
				// handle entity behaviour and transformation offsets
				// var timeStart = performance.now();

				if (taro.gameLoopTickHasExecuted) {
					if (entity._deathTime !== undefined && entity._deathTime <= taro._tickStart) {
						// Check if the deathCallBack was set
						if (entity._deathCallBack) {
							entity._deathCallBack.apply(entity);
							delete entity._deathCallBack;
						}

						entity.destroy();
					}

					if (entity._behaviour && !entity.isHidden()) {
						entity._behaviour();
					}

					// handle streamUpdateData
					if (taro.client.myPlayer) {
						var updateQueue = taro.client.entityUpdateQueue[entityId];
						var processedUpdates = [];

						if (updateQueue) {							
							for (var key in updateQueue) {
								var value = updateQueue[key];

								// ignore update if the value hasn't changed since the last update. this is to prevent unnecessary updates
								if (entity.lastUpdatedData[key] == value) {
									if (entity._category == 'item' && entity.getOwnerUnit() == taro.client.selectedUnit) 
										console.log("ignoring update")
									delete taro.client.entityUpdateQueue[entityId][key]
									continue;
								}

								if (
									// Don't run if we're updating item's state/owner unit, but its owner doesn't exist yet
									entity._category == 'item' &&
									(   // updating item's owner unit, but the owner hasn't been created yet
										(key == "ownerUnitId" && taro.$(value) == undefined) || 
										(   // changing item's state to selected/unselected, but owner doesn't exist yet
											(key == "stateId" && (value == "selected" || value == "unselected")) &&
											entity.getOwnerUnit() == undefined
										)
									)
								) {
									continue;
								} else {
									processedUpdates.push({[key]: value});
									if (entity._category == 'item' && entity.getOwnerUnit() == taro.client.selectedUnit) 
										console.log(entity._stats.name, {[key]: value})
									delete taro.client.entityUpdateQueue[entityId][key]
								}
							}
						}						

						if (processedUpdates.length > 0) {
							// console.log(processedUpdates)
							entity.streamUpdateData(processedUpdates);
							// processedUpdates.forEach((value) => {
							// 	console.log(value);
							// });
						}
					}
				}

				// taro.profiler.logTimeElapsed('entity._behaviour()', timeStart);

				// if (entity.phaserEntity?.gameObject?.visible && (entity.isTransforming() || entity.tween?.isTweening || entity == taro.client.selectedUnit)) {
				if (entity.isTransforming() || entity == taro.client.selectedUnit) {

					// update transformation using incoming network stream
					// var timeStart = performance.now();
					entity._processTransform();
				}
				
				// taro.profiler.logTimeElapsed('first _processTransform', timeStart);
			
				if (entity._translate && !entity.isHidden()) {
					
					var x = entity._translate.x;
					var y = entity._translate.y;
					var rotate = entity._rotate.z;

					if (entity._category == 'item') {
						var ownerUnit = entity.getOwnerUnit();

						if (ownerUnit) {
							// var timeStart = performance.now();
							// if ownerUnit's transformation hasn't been processed yet, then it'll cause item to drag behind. so we're running it now
							ownerUnit._processTransform();

							// rotate weldjoint items to the owner unit's rotation
							if (entity._stats.currentBody && entity._stats.currentBody.jointType == 'weldJoint') {
								rotate = ownerUnit._rotate.z;
							// immediately rotate my unit's items to the angleToTarget
							} else if (ownerUnit == taro.client.selectedUnit && entity._stats.controls?.mouseBehaviour?.rotateToFaceMouseCursor) {
								rotate = ownerUnit.angleToTarget; // angleToTarget is updated at 60fps								
							}
							entity._rotate.z = rotate // update the item's rotation immediately for more accurate aiming (instead of 20fps)

							entity.anchoredOffset = entity.getAnchoredOffset(rotate);

							if (entity.anchoredOffset) {
								x = ownerUnit._translate.x + entity.anchoredOffset.x;
								y = ownerUnit._translate.y + entity.anchoredOffset.y;
								rotate = entity.anchoredOffset.rotate;
							}
							// taro.profiler.logTimeElapsed('second _processTransform', timeStart);
					
						}
					}
				}

				if (entity.tween?.isTweening) {
					entity.tween.update();
					x += entity.tween.offset.x;
					y += entity.tween.offset.y;
					rotate += entity.tween.offset.rotate;
				}

				if (entity.tween?.isTweening || entity.isTransforming()) {
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
	}

	frameTick(): void {
		taro.engineStep(Date.now(), 1000/60);
		taro.input.processInputOnEveryFps();

		taro._renderFrames++;

		this.updateAllEntities();

			
	}
}
