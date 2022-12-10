var Unit = IgeEntityPhysics.extend({
	classId: 'Unit',

	init: function (data, entityIdFromServer) {
		IgeEntityPhysics.prototype.init.call(this, data.defaultData);

		this.id(entityIdFromServer);
		var self = this;
		self.dob = Date.now();

		self.direction = {
			x: 0,
			y: 0
		};

		self.isMoving = false;
		self.angleToTarget = undefined;
		this.category('unit');

		// merge various data into one _stats variable
		var unitData = {};
		if (!data.hasOwnProperty('equipmentAllowed')) {
			data.equipmentAllowed = 9;
		}
		unitData = ige.game.getAsset('unitTypes', data.type);

		self._stats = _.merge(unitData, data);

		self.entityId = entityIdFromServer;

		// dont save variables in _stats as _stats is stringified and synced
		// and some variables of type unit, item, projectile may contain circular json objects
		if (self._stats.variables) {
			self.variables = self._stats.variables;
			delete self._stats.variables;
		}

		// convert numbers stored as string in database to int
		self.parseEntityObject(self._stats);
		self.addComponent(InventoryComponent)
			.addComponent(AbilityComponent)
			.addComponent(AttributeComponent); // every units gets one

		self.addComponent(ScriptComponent); // entity-requireScriptLoading
		if (unitData && unitData) {
			self.script.load(unitData.scripts);
		}

		self.addComponent(AIComponent);

		this._stats.itemIds = new Array(self._stats.inventorySize).fill(null);

		Unit.prototype.log(`initializing new unit ${this.id()}`);

		if (ige.isClient) {
			this.addToRenderer(defaultAnimation && (defaultAnimation.frames[0] - 1));
			ige.client.emit('create-unit', this);
			this.transformTexture(this._translate.x, this._translate.y, 0);

			if (this._stats.states) {
				var currentState = this._stats.states[this._stats.stateId];
				if (currentState) {
					var defaultAnimation = this._stats.animations[currentState.animation];
				}
			}
		}

		// initialize body & texture of the unit
		self.changeUnitType(data.type, data.defaultData, true);

		if (self._stats.scale) {

		}
		if (self._stats.scaleBody) {
			self._stats.scale = parseFloat(self._stats.scaleBody);
		} else {
			if (!self._stats.scale) {
				self._stats.scale = (self._stats.currentBody && self._stats.currentBody.spriteScale > 0) ? self._stats.currentBody.spriteScale : 1;
			}
		}
		self._stats.fadingTextQueue = [];
		self.particleEmitters = {};

		self._stats.buffs = [];

		if (ige.isServer) {
			// store mapping between clientIds (to whom minimap unit of this unit is visible)
			// and their respective color because sometimes it may happen that unit is not yet created on client
			// hence while making its minimap unit we will get null as unit
			self._stats.minimapUnitVisibleToClients = {};
			self.mount(ige.$('baseScene'));
			if (ige.network.isPaused) {
				this.streamMode(0);
			} else {
				this.streamMode(1);
			}

			ige.server.totalUnitsCreated++;

		} else if (ige.isClient) {
			// if player already exists on the client side, then set owner player and update its name label
			// otherwise, client.js will wait for player entity and run this on client.js
			if (this._stats.ownerId) {
				// if the owner player entity is received on the client side already
				const ownerPlayer = ige.$(this._stats.ownerId);
				if (ownerPlayer) {
					this.setOwnerPlayer(this._stats.ownerId);
					this.equipSkin();
				}
			}

			var networkId = ige.network.id();
			self.addComponent(UnitUiComponent);

			if (!self.gluedEntities) {
				self.gluedEntities = [];
			}
			// .addComponent(EffectComponent);

			if (networkId == self._stats.clientId) {
				for (i in self.attr) {
					ige.playerUi.updateAttrBar(i, self.attr[i], self.max[i]);
				}

				if (window.adBlockEnabled) {
					// self.unEquipSkin(null, true);
				}
			}

			self._scaleTexture();

			var polygon = new IgePoly2d();
			self.triggerPolygon(polygon);
			self.flip(self._stats.flip);
			self.mouseEvents();
		}
		self.playEffect('create');
		self.addBehaviour('unitBehaviour', self._behaviour);
		self.scaleDimensions(self._stats.width, self._stats.height);
	},

	shouldRenderAttribute: function (attribute) {
		var self = this;

		if (attribute.isVisible == undefined) {
			return false;
		}

		var ownerPlayer = self.getOwner();

		if (!ownerPlayer) {
			return false;
		}

		// for now render it if at least one of unit bar is selected
		var shouldRender = Array.isArray(attribute.isVisible) && (
			(ownerPlayer.isHostileTo(ige.client.myPlayer) && attribute.isVisible.indexOf('unitBarHostile') > -1) ||
			(ownerPlayer.isFriendlyTo(ige.client.myPlayer) && attribute.isVisible.indexOf('unitBarFriendly') > -1) ||
			(ownerPlayer.isNeutralTo(ige.client.myPlayer) && attribute.isVisible.indexOf('unitBarNeutral') > -1)
		);

		if (shouldRender) {
			var showOnlyWhenIsGreaterThanMin = attribute.showWhen == 'whenIsGreaterThanMin';
			shouldRender = showOnlyWhenIsGreaterThanMin ? attribute.value > attribute.min : true;
		}
		if (shouldRender) {
			var showOnlyWhenIsLessThanMax = attribute.showWhen == 'whenIsLessThanMax';
			shouldRender = showOnlyWhenIsLessThanMax ? attribute.value < attribute.max : true;
		}
		if (shouldRender) {
			var showOnlyWhenValueChanged = attribute.showWhen == 'valueChanges';
			shouldRender = showOnlyWhenValueChanged ? attribute.hasChanged : true;
		}

		return shouldRender;
	},

	redrawAttributeBars: function () {
		var self = this;
		var allAttributes = JSON.parse(JSON.stringify(self._stats.attributes || {}));
		var attributesToRender = [];
		var ownerPlayer = self.getOwner();

		if (self.attributeBars) {
			for (var attributeBarInfo of self.attributeBars) {
				var unitBarId = attributeBarInfo.id;
				var unitBar = ige.$(unitBarId);

				unitBar.destroy();
			}
		}

		self.attributeBars = [];

		if (!ownerPlayer) {
			this.emit('render-attributes', {
				attrs: attributesToRender
			});
			return;
		}

		// filter out attributes to render depending on this unit and client's unit
		var attributeKeys = Object.keys(allAttributes);
		for (var attributeKey of attributeKeys) {
			var attribute = allAttributes[attributeKey];
			if (attribute) {
				attribute.key = attributeKey;

				var shouldRender = self.shouldRenderAttribute(attribute);

				if (shouldRender) {
					attributesToRender.push(attribute);
				}
			}
		}

		for (var i = 0; i < attributesToRender.length; i++) {
			var attribute = attributesToRender[i];
			attribute.index = i + 1;

			var unitBar = new UnitAttributeBar(self.id(), attribute);

			self.attributeBars.push({
				id: unitBar.id(),
				attribute: attribute.key,
				index: i
			});
		}

		this.emit('render-attributes', {
			attrs: attributesToRender
		});
	},

	updateAttributeBar: function (attr) {
		var self = this;

		if (attr && self.attributeBars) {
			var unitBarId = null;

			for (var i = 0; i < self.attributeBars.length; i++) {
				var attributeBarInfo = self.attributeBars[i];

				if (attributeBarInfo.attribute === attr.type) {
					attr.index = i + 1;
					unitBarId = attributeBarInfo.id;
				}
			}

			var unitBar = ige.$(unitBarId);
			var shouldRender = self.shouldRenderAttribute(attr);

			if (unitBar) {

				if (shouldRender) {
					unitBar.updateBar(attr);
				} else {
					self.attributeBars = self.attributeBars.filter(function (bar) {
						return bar.id !== unitBar.id();
					});

					unitBar.destroy();
				}
			} else {

				if (shouldRender) {
					attr.index = self.attributeBars.length + 1;

					unitBar = new UnitAttributeBar(self.id(), attr);

					self.attributeBars.push({
						id: unitBar.id(),
						attribute: attr.type,
						index: self.attributeBars.length
					});
				}
			}

			this.emit('update-attribute', {
				attr: attr,
				shouldRender: shouldRender
			});
		}
	},

	// returns player that owns this unit
	getOwner: function () {
		return this.ownerPlayer;
	},

	// set this unit's owner, and insert this unit's id into its owner's ._stats.unitIds array
	// if we are changing the ownership from another player to a new player,
	// then update UI accordingly (camera, attribute bar, and inventory)
	setOwnerPlayer: function (newOwnerPlayerId, config) {
		var self = this;

		// remove this unit from previous owner
		var previousOwnerPlayer = self.getOwner();
		self.ownerPlayer = undefined;
		if (previousOwnerPlayer && previousOwnerPlayer.id() !== newOwnerPlayerId) {
			previousOwnerPlayer.disownUnit(self);
		}
		// add this unit to the new owner
		var newOwnerPlayer = newOwnerPlayerId ? ige.$(newOwnerPlayerId) : undefined;

		if (newOwnerPlayer && newOwnerPlayer._stats) {
			self._stats.ownerId = newOwnerPlayerId;
			self.ownerPlayer = newOwnerPlayer;
			// self._stats.name = (config && config.dontUpdateName) // if unit already has name dont update it
			// 											? (self._stats.name || newOwnerPlayer._stats.name)
			// 											: newOwnerPlayer._stats.name;
			self._stats.clientId = newOwnerPlayer && newOwnerPlayer._stats ? newOwnerPlayer._stats.clientId : undefined;
			if (ige.isServer) {
				self.streamUpdateData([{ ownerPlayerId: newOwnerPlayerId }]);
				newOwnerPlayer.ownUnit(self);
			}
		}

		if (ige.isClient) {
			if (newOwnerPlayer) {
				self.updateNameLabel();
				self.redrawAttributeBars();

				var isMyUnitUpdated = newOwnerPlayer._stats.clientId == ige.network.id();
				if (isMyUnitUpdated) {
					// update UI
					ige.playerUi.updatePlayerAttributesDiv(newOwnerPlayer._stats.attributes);
				}

				if (ige.scoreboard && newOwnerPlayer._stats.clientId == ige.network.id()) {
					ige.scoreboard.update();
				}

				// execute only for myplayer
				if (newOwnerPlayer._stats.selectedUnitId == self.id() && ige.network.id() == self._stats.clientId) {
					if (self.inventory) {
						self.inventory.createInventorySlots();
					}
					if (self.unitUi) {
						self.unitUi.updateAllAttributeBars();
					}
				}
			}
		}
	},

	canAffordItem: function (itemTypeId) {
		var self = this;
		var ownerPlayer = self.getOwner();
		var lastOpenedShop = ownerPlayer._stats.lastOpenedShop;
		var shopItems = ige.game.data.shops[lastOpenedShop] ? ige.game.data.shops[lastOpenedShop].itemTypes : [];
		var itemData = ige.shop.getItemById(itemTypeId);
		var shopData = shopItems[itemTypeId];

		// checking for atribute price
		for (var attributeTypeId in shopData.price.playerAttributes) {
			if (ownerPlayer._stats.attributes && ownerPlayer._stats.attributes[attributeTypeId]) {
				var playerAttrValue = ownerPlayer._stats.attributes[attributeTypeId].value;
				if (shopData.price.playerAttributes[attributeTypeId] > playerAttrValue) {
					return false;
				}
			}
		}

		// checking for recipe
		var requiredItemTypeIds = Object.keys(shopData.price.requiredItemTypes || {});
		for (var j = 0; j < requiredItemTypeIds.length; j++) {
			var reqItemTypeId = requiredItemTypeIds[j];
			var requiredQty = shopData.price.requiredItemTypes[reqItemTypeId];
			var actualQty = self.inventory.getQuantity(reqItemTypeId);
			if (!self.inventory.hasItem(reqItemTypeId) || (actualQty != undefined && actualQty < requiredQty)) {
				return false;
			}
		}

		// checking for coins
		if (shopData.price.coins && ownerPlayer._stats.coins < shopData.price.coins) {
			return false;
		}

		return true;
	},

	buyItem: function (itemTypeId, token) {
		var self = this;
		var ownerPlayer = self.getOwner();
		// buyItem only runs on server.
		// the unit that's buying an item must have an owner player
		// don't allow ad-block-enabled players to buy items
		// || ownerPlayer._stats.isAdBlockEnabled
		if (!ige.isServer || !ownerPlayer)
			return;

		var lastOpenedShop = ownerPlayer._stats.lastOpenedShop;
		var shopItems = ige.game.data.shops[lastOpenedShop] ? ige.game.data.shops[lastOpenedShop].itemTypes : [];
		var itemData = ige.shop.getItemById(itemTypeId);

		// return if:
		// itemType of given itemTypeId doesn't exist
		// itemType is not assigned to any shops
		if (!itemData || !shopItems[itemTypeId])
			return;

		var shopData = shopItems[itemTypeId];

		// quantity will be Default Quantity by default
		if (parseFloat(shopData.quantity) >= 0) {
			itemData.quantity = parseFloat(shopData.quantity);
		}

		// checking for requirements
		var requirementsSatisfied = true;
		var requiredItemTypeIds = Object.keys(shopData.requirement.requiredItemTypes || {});

		if (typeof shopData.requirement === 'object') {
			// checking for attributes requirements;
			for (var priceAttr in shopData.requirement.playerAttributes) {
				if (ownerPlayer && ownerPlayer._stats.attributes[priceAttr]) {
					var req = shopData.requirement.playerAttributes[priceAttr];
					switch (req.type) {
						case 'atmost':
							if (ownerPlayer._stats.attributes[priceAttr].value > req.value) {
								requirementsSatisfied = false;
							}
							break;
						case 'exactly':
							if (ownerPlayer._stats.attributes[priceAttr].value != req.value) {
								requirementsSatisfied = false;
							}
							break;
						case 'atleast':
						default:
							if (ownerPlayer._stats.attributes[priceAttr].value < req.value) {
								requirementsSatisfied = false;
							}
							break;
					}
					if (!requirementsSatisfied) {
						break;
					}
				}
			}

			// return if requirement not met
			if (!requirementsSatisfied) return;

			// checking for item requirements
			for (var j = 0; j < requiredItemTypeIds.length; j++) {
				var reqItemTypeId = requiredItemTypeIds[j];
				var requiredQuantity = shopData.requirement.requiredItemTypes[reqItemTypeId];
				requirementsSatisfied = self.inventory.hasRequiredQuantity(reqItemTypeId, requiredQuantity);
				if (!requiredItemTypeIds) {
					break;
				}
			}
			// return if requirement not met
			if (!requirementsSatisfied) return;
		}

		if (self.canAffordItem(itemTypeId) && self.canCarryItem(itemData)) {
			// console.log("buyItem - getFirstAvailableSlotForItem", self.inventory.getFirstAvailableSlotForItem(itemData), "replaceItemInTargetSlot", shopData.replaceItemInTargetSlot)

			if (itemData.isUsedOnPickup || self.inventory.getFirstAvailableSlotForItem(itemData) > -1 || shopData.replaceItemInTargetSlot) {
				var attrData = { attributes: {} };

				// pay attributes
				for (var attributeTypeId in shopData.price.playerAttributes) {
					var newValue = ownerPlayer.attribute.getValue(attributeTypeId) - shopData.price.playerAttributes[attributeTypeId];
					attrData.attributes[attributeTypeId] = ownerPlayer.attribute.update(attributeTypeId, newValue, true); // pay the price
					ownerPlayer.attribute.update(attributeTypeId, attrData.attributes[attributeTypeId], true);
				}

				// pay recipes
				var requiredItemTypeIds = Object.keys(shopData.price.requiredItemTypes || {});
				var totalInventorySize = self.inventory.getTotalInventorySize();
				for (var i = 0; i < requiredItemTypeIds.length; i++) {
					var reqItemTypeId = requiredItemTypeIds[i];
					var balanceOwed = shopData.price.requiredItemTypes[reqItemTypeId];

					if (!isNaN(parseFloat(balanceOwed))) {
						var j = 0;
						// traverse through all items in the inventory, find matching item that needs to be consumed, and consume required qty
						while (balanceOwed > 0 && j < totalInventorySize) {
							var itemToBeConsumed = self.inventory.getItemBySlotNumber(j + 1);
							if (itemToBeConsumed && itemToBeConsumed._stats && itemToBeConsumed._stats.itemTypeId == reqItemTypeId) {
								// decreasing quantity from item from inventory if quantity is greater.
								if (itemToBeConsumed._stats.quantity != undefined && itemToBeConsumed._stats.quantity != null && itemToBeConsumed._stats.quantity >= balanceOwed) {
									itemToBeConsumed._stats.quantity -= balanceOwed;
									balanceOwed = 0;
									itemToBeConsumed.streamUpdateData([{ quantity: itemToBeConsumed._stats.quantity }]);
								} else if (itemToBeConsumed._stats.quantity > 0) { // what does this do Parth?
									var lowerQty = Math.min(itemToBeConsumed._stats.quantity, balanceOwed);
									balanceOwed -= lowerQty;
									itemToBeConsumed.updateQuantity(itemToBeConsumed._stats.quantity - lowerQty);
								}
								if (itemToBeConsumed._stats.quantity == undefined) { // if item has infinite quantity, then give it all.
									balanceOwed = 0;
								}

								if (itemToBeConsumed._stats.quantity == 0 && itemToBeConsumed._stats.removeWhenEmpty === true) {
									self.dropItem(itemToBeConsumed._stats.slotIndex);
									itemToBeConsumed.remove();
								}
							}
							j++;
						}
					} else if (itemToBeConsumed && (!itemToBeConsumed._stats.quantity && itemToBeConsumed._stats.quantity !== 0) && (!balanceOwed && balanceOwed !== 0)) {
						self.dropItem(itemToBeConsumed._stats.slotIndex);
						itemToBeConsumed.remove();
					}
				}

				// pay coins
				if (shopData.price.coins && ownerPlayer._stats.coins >= shopData.price.coins) {
					// disable coin consuming due to some bug wrt coins
					// add coin consuming code
					if (ige.game.data.defaultData.tier >= 2) {
						
						try {
							const jwt = require("jsonwebtoken");
							
							const isUsedToken = ige.server.usedCoinJwts[token];
							if (isUsedToken) {
								console.log('Token has been used already', token);
								return;
							}
							
							const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
							const {type, userId, purchasableId, createdAt} = decodedToken;
							
							if (type === 'pinValidationToken' && userId && purchasableId && ownerPlayer._stats.userId === userId && purchasableId === itemTypeId) {
								// allow coin transaction since token has been verified
								
								// store token for current client
								ige.server.usedCoinJwts[token] = createdAt;
								
								// remove expired tokens
								const filteredUsedCoinJwts = {};
								const usedTokenEntries = Object.entries(ige.server.usedCoinJwts).filter(([token, tokenCreatedAt]) => (Date.now() - tokenCreatedAt) < ige.server.COIN_JWT_EXPIRES_IN);
								for (const [key, value] of usedTokenEntries) {
									if (typeof value === 'number') {
										filteredUsedCoinJwts[key] = value;
									}
								}
								ige.server.usedCoinJwts = filteredUsedCoinJwts;
								
							} else {
								return;
							}
						} catch (e) {
							console.log('invalid pinValidationToken', e.message, token);
							return;
						}
						
						ige.server.consumeCoinFromUser(ownerPlayer, shopData.price.coins, itemTypeId);
														
						ownerPlayer.streamUpdateData([{
								coins: ownerPlayer._stats.coins - shopData.price.coins
						}])
					}
				}

				// remove the first item matching targetSlots if replaceItemInTargetSlot is set as true
				var targetSlots = (itemData.controls && Array.isArray(itemData.controls.permittedInventorySlots)) ? itemData.controls.permittedInventorySlots : undefined;
				if (targetSlots != undefined && targetSlots[0] > 0) {
					var existingItem = self.inventory.getItemBySlotNumber(targetSlots[0]);
					if (existingItem && shopData.replaceItemInTargetSlot) {
						existingItem.remove();
					}
				}

				itemData.itemTypeId = itemTypeId;
				ige.network.send('ui', { command: 'shopResponse', type: 'purchase' }, self._stats.clientId);
				// item purchased and pickup
				self.pickUpItem(itemData, shopData.replaceItemInTargetSlot);
			} else {
				ige.network.send('ui', { command: 'shopResponse', type: 'inventory_full' }, self._stats.clientId);
			}
		}
	},

	buyUnit: function (unitTypeId) {
		var self = this;

		if (ige.isServer) {
			var ownerPlayer = self.getOwner();
			var lastOpenedShop = ownerPlayer._stats.lastOpenedShop;
			var shopUnits = ige.game.data.shops[lastOpenedShop] ? ige.game.data.shops[lastOpenedShop].unitTypes : [];
			var selectedUnitShop = shopUnits[unitTypeId];
			var unitData = ige.shop.getUnitById(unitTypeId);
			if (selectedUnitShop && selectedUnitShop.isPurchasable) {
				var isAffordable = true;
				var requirementsSatisfied = true;
				if (typeof selectedUnitShop.requirement === 'object') {
					for (var attributeTypeId in selectedUnitShop.requirement.playerAttributes) {
						var unitPrice = selectedUnitShop.requirement.playerAttributes[attributeTypeId];

						var playerAttrValue = ownerPlayer._stats.attributes[attributeTypeId].value;
						if (unitPrice > playerAttrValue) {
							requirementsSatisfied = false;
							break;
						}
					}
				}
				if (requirementsSatisfied && typeof selectedUnitShop.price === 'object') {
					for (var attributeTypeId in selectedUnitShop.price.playerAttributes) {
						var req = selectedUnitShop.price.playerAttributes[attributeTypeId];
						switch (req.type) {
							case 'atmost':
								if (ownerPlayer._stats.attributes[attributeTypeId].value > req.value) {
									requirementsSatisfied = false;
								}
								break;
							case 'exactly':
								if (ownerPlayer._stats.attributes[attributeTypeId].value != req.value) {
									requirementsSatisfied = false;
								}
								break;
							case 'atleast':
							default:
								if (ownerPlayer._stats.attributes[attributeTypeId].value < req.value) {
									requirementsSatisfied = false;
								}
								break;
						}
						if (!requirementsSatisfied) {
							break;
						}
					}
				}
				if (isAffordable && requirementsSatisfied) {
					if (ownerPlayer) {
						var attributes = {};
						if (typeof selectedUnitShop.price === 'object' && Object.keys(selectedUnitShop.price).length > 0) {
							for (var attributeTypeId in selectedUnitShop.price.playerAttributes) {
								var unitPrice = selectedUnitShop.price.playerAttributes[attributeTypeId];
								attributes[attributeTypeId] = ownerPlayer._stats.attributes[attributeTypeId].value - unitPrice;
								ownerPlayer.attribute.update(attributeTypeId, attributes[attributeTypeId], true);
							}
						}
						// self.streamUpdateData([{
						//     type: unitData.unitTypeId
						// }])

						ige.game.lastPurchasedUniTypetId = unitData.unitTypeId;
						ige.script.trigger('playerPurchasesUnit', {
							unitId: self.id(),
							playerId: ownerPlayer.id()
						});
					}
				}
			}
		}
	},

	refillAllItemsAmmo: function () {
		var self = this;
		for (var i = 0; i < 12; i++) {
			var item = self.inventory.getItemBySlotNumber(i + 1);
			if (item && item._stats.isGun) {
				item._stats.ammo = item._stats.ammoSize;
				item._stats.ammoTotal = item._stats.ammoSize * 3;
			}
		}
	},

	getBaseDamage: function () {
		return this._stats.attributes.damage && this._stats.attributes.damage.value || 0;
	},

	// hold an item given in the inventory slot. hide the last item
	// @currentItemIndex refers to the selected item slot
	changeItem: function (itemIndex) {
		//console.log('change item',itemIndex)
		var self = this;

		if (itemIndex == undefined) {
			itemIndex = self._stats.currentItemIndex;
		}

		var newItem = ige.$(self._stats.itemIds[itemIndex]) || null;
		var oldItem = ige.$(self._stats.currentItemId) || null;

		// console.log(`running Unit.changeItem(${itemIndex}) on ${ige.isClient ? 'Client' : 'Server'}`);

		if (newItem && newItem.id() == self._stats.currentItemId) {
			return;
		}

		if (oldItem) {
			oldItem.stopUsing();
			oldItem.setState('unselected');
			if (ige.isClient) {
				oldItem.applyAnimationForState('unselected');
			}
		}

		// show the item that's in the selected slot
		if (newItem) {
			newItem.setState('selected');

			var triggeredBy = { // WARNING: Should this be outside if (newItem) so we can send trigger for unit swapping item even if empty slot?
				itemId: newItem.id(),
				unitId: this.id()
			};
			ige.queueTrigger('unitSelectsItem', triggeredBy);

			// whip-out the new item using tween
			if (ige.isClient) {
				//emit size event
				newItem.emit('size', {
					width: newItem._stats.currentBody.width, // this could be causing item size issues by using currentBody dimensions
					height: newItem._stats.currentBody.height
				});

				newItem.applyAnimationForState('selected');

				let customTween = {
					type: 'swing',
					keyFrames: [[0, [0, 0, -1.57]], [100, [0, 0, 0]]]
				};

				newItem.tween.start(null, this._rotate.z, customTween);
			}
		}

		if (ige.isServer) {
			this.streamUpdateData([{ currentItemIndex: itemIndex }]);
		}

		this.script.trigger('unitSelectsInventorySlot');

		if (ige.isClient && this == ige.client.selectedUnit) {
			this.inventory.highlightSlot(itemIndex + 1);
			var item = this.inventory.getItemBySlotNumber(itemIndex + 1);
			ige.itemUi.updateItemInfo(item);
		}

		// update index and id in the same place
		this.setCurrentItem(itemIndex);
	},

	// added boolean isUnitCreation to tell whether the function call came from init or elsewhere
	changeUnitType: function (type, defaultData, isUnitCreation) {
		var self = this;
		self.previousState = null;

		var data = ige.game.getAsset('unitTypes', type);
		delete data.type // hotfix for dealing with corrupted game json that has unitData.type = "unitType". This is caused by bug in the game editor.

		// console.log("change unit type", type)
		if (data == undefined) {
			ige.script.errorLog('changeUnitType: invalid data');
			return;
		}

		self.script.load(data.scripts);

		self._stats.type = type;

		if (!isUnitCreation) {
			// adding this flag so that clients receiving entity data from onStreamCreate don't overwrite values with default data
			// when they are created by a client that has just joined.
			var oldAttributes = self._stats.attributes;

			for (var i in data) {
				if (i == 'name') { // don't overwrite unit's name with unit type name
					continue;
				}

				self._stats[i] = data[i];
			}

			// if the new unit type has the same entity variables as the old unit type, then pass the values
			var variables = {};
			if (data.variables) {
				for (var key in data.variables) {
					if (self.variables && self.variables[key]) {
						variables[key] = self.variables[key] == undefined ? data.variables[key] : self.variables[key];
					} else {
						variables[key] = data.variables[key];
					}
				}
				self.variables = variables;
			}

			// deleting variables from stats bcz it causes json.stringify error due to variable of type unit,item,etc.
			if (self._stats.variables) {
				delete self._stats.variables;
			}

			if (data.attributes) {
				for (var attrId in data.attributes) {
					if (data.attributes[attrId]) {
						var attributeValue = data.attributes[attrId].value; // default attribute value from new unit type
						// if old unit type had a same attribute, then take the value from it.
						/*if (oldAttributes && oldAttributes[attrId]) {
							attributeValue = oldAttributes[attrId].value;
						}*/

						if (this._stats.attributes[attrId]) {
							this._stats.attributes[attrId].value = Math.max(data.attributes[attrId].min, Math.min(data.attributes[attrId].max, parseFloat(attributeValue)));
						}
					}
				}
			}
		}

		self.setState(this._stats.stateId, defaultData);

		if (ige.isClient) {
			self.updateTexture();
			self.emit('update-texture', 'using_skin');
			self._scaleTexture();
		}

		// update bodies of all items in the inventory
		for (let i = 0; i < self._stats.itemIds.length; i++) {
			var itemId = self._stats.itemIds[i];
			var item = ige.$(itemId);
			if (item) {
				// removing passive attributes
				if (item._stats.bonus && item._stats.bonus.passive) {
					if (item._stats.slotIndex < this._stats.inventorySize || item._stats.bonus.passive.isDisabledInBackpack != true) {
						self.updateStats(itemId, true);
					}
				} else {
					self.updateStats(itemId, true);
				}

				// if the new unit type cannot carry the item, then remove it.
				if (self.canCarryItem(item._stats) == false) {
					item.remove();
				} else if (self.canUseItem(item._stats)) { // if unit cannot use the item, then unselect the item
					if (item._stats.slotIndex != undefined && self._stats.currentItemIndex != undefined) {
						if (self._stats.currentItemIndex === item._stats.slotIndex) {
							item.setState('selected');
						} else {
							item.setState('unselected');
						}
					}
				} else {
					item.setState('unselected');
				}

				// adding back passive attributes
				if (item._stats.bonus && item._stats.bonus.passive) {
					if (item._stats.slotIndex < this._stats.inventorySize || item._stats.bonus.passive.isDisabledInBackpack != true) {
						self.updateStats(itemId);
					}
				} else {
					self.updateStats(itemId);
				}
			}
		}

		if (ige.isServer) {
			self._stats.currentItemIndex = 0;
			self._stats.currentItemId = null;

			// give default items to the unit
			if (data.defaultItems) {
				for (var i = 0; i < data.defaultItems.length; i++) {
					var item = data.defaultItems[i];

					var itemData = ige.game.getAsset('itemTypes', item.key);
					if (itemData) {
						itemData.itemTypeId = item.key;
						self.pickUpItem(itemData);
					}
				}
			}

			self.changeItem(self._stats.currentItemIndex); // this will call change item on client for all units
		} else if (ige.isClient) {
			var zIndex = self._stats.currentBody && self._stats.currentBody['z-index'] || { layer: 3, depth: 3 };

			if (zIndex && ige.network.id() == self._stats.clientId && !ige.game.data.heightBasedZIndex) {
				// depth of this player's units should have +1 depth to avoid flickering on overlap
				zIndex.depth++;
			}

			self.updateLayer();

			var ownerPlayer = self.getOwner();
			if (ownerPlayer && ownerPlayer._stats.selectedUnitId == self.id() && this._stats.clientId == ige.network.id()) {
				self.inventory.createInventorySlots();
			}

			// destroy existing particle emitters first
			for (var particleId in self.particleEmitters) {
				if (self.particleEmitters[particleId]) {
					self.particleEmitters[particleId].destroy();
					delete self.particleEmitters[particleId];
				}
			}

			// remove forceredraw from attributebar bcz it was calling
			// redraw for units which are not having attributebars too
			self.redrawAttributeBars();
			self.equipSkin(undefined);
			// if mobile controls are in use configure for this unit
			self.renderMobileControl();

			if (self.unitUi) {
				self.unitUi.updateAllAttributeBars();
			}
			self.inventory.update();
		}

		if (self.ai && self._stats.ai) {
			if (self._stats.ai.enabled) {
				self.ai.enable();
			} else {
				self.ai.disable();
			}
		}
	},

	addAttributeBuff: function (attributeId, value, time, percentage) {
		var self = this;
		if (!ige.isServer) return;
		// 1. store the unit's current attribute values. let's say we had 500/600 HP (base max 100hp)
		var currentType = this._category === 'unit' ? 'unitTypes' : 'playerTypes';
		var currentEntityTypeId = this._category === 'unit' ? 'type' : 'playerTypeId';
		var baseEntityStats = ige.game.getAsset(currentType, this._stats[currentEntityTypeId]);
		if (!baseEntityStats) {
			return;
		}

		if (!time) {
			return;
		}
		var timeLimit = Date.now() + time;
		var unit = self;

		if (attributeId && value && unit) {
			var selectedAttribute = this._stats.attributes[attributeId];
			if (selectedAttribute) {
				var currentAttributeValue = parseFloat(selectedAttribute.value) || 1;
				var maxValue = parseFloat(selectedAttribute.max);

				if (currentAttributeValue != undefined) {
					if (percentage == true) {
						var newMax = maxValue * (1 + parseFloat(value) / 100);
						var newValue = currentAttributeValue * (1 + parseFloat(value) / 100);
						this._stats.buffs.push({ attrId: attributeId, value: newMax - maxValue, timeLimit: timeLimit, percentage: percentage });
					} else {
						var newMax = maxValue + parseFloat(value);
						var newValue = Math.min(newMax, Math.max(selectedAttribute.min, currentAttributeValue)) + value;
						this._stats.buffs.push({ attrId: attributeId, value: value, timeLimit: timeLimit, percentage: percentage });
					}

					this.attribute.setMax(attributeId, newMax);
					this.attribute.update(attributeId, newValue, true);
				}
			}
		}
	},

	removeAttributeBuff: function (attributeId, value, index) {
		var self = this;
		if (!ige.isServer) return;
		// 1. store the unit's current attribute values. let's say we had 500/600 HP (base max 100hp)
		var currentType = this._category === 'unit' ? 'unitTypes' : 'playerTypes';
		var currentEntityTypeId = this._category === 'unit' ? 'type' : 'playerTypeId';
		var baseEntityStats = ige.game.getAsset(currentType, this._stats[currentEntityTypeId]);
		if (!baseEntityStats) {
			return;
		}
		var unit = self;

		if (attributeId && value && unit) {
			var selectedAttribute = this._stats.attributes[attributeId];
			if (selectedAttribute) {
				var currentAttributeValue = parseFloat(selectedAttribute.value) || 1;
				var maxValue = parseFloat(selectedAttribute.max);

				if (currentAttributeValue != undefined) {
					var newMax = maxValue - parseFloat(value);
					var newValue = Math.min(newMax, Math.max(selectedAttribute.min, currentAttributeValue));

					this.attribute.setMax(attributeId, newMax);
					this.attribute.update(attributeId, newValue, true);
					this._stats.buffs.splice(index, 1);
				}
			}
		}
	},

	renderMobileControl: function () {
		var self = this;

		if (ige.mobileControls &&
			self._stats &&
			ige.network.id() == self._stats.clientId &&
			ige.client.myPlayer &&
			ige.client.myPlayer._stats.selectedUnitId == this.id() &&
			this._stats.controls) {
			ige.mobileControls.configure(this._stats.controls.abilities);
		}
	},

	/**
        give an item to a unit whether it's an existing item instance (item object) or a new item to be created from itemData (json).
        @param item can be both item instance or itemData json. This is to handle both new items being created from itemData, or when unit picks up an existing item instance.
        @param slotIndex force-assign item into this inventory slot. usually assigned from when buying a shop item with replaceItemInTargetSlot (optional)
        @return {boolean} return true if unit was able to pickup/use item. return false otherwise.
	 */
	pickUpItem: function (item) {
		var self = this;
		// all Server only
		// console.log(`running Unit.pickUpItem() on ${ige.isClient ? 'Client' : 'Server'}`);
		// if item is suppose to be consumed immediately
		// this ensures that item is picked up only once, and is only picked up by units that can pick up this item
		var itemData = item._stats || item;
		var isItemInstance = item._category === 'item';
		var itemTypeId = itemData.itemTypeId;

		if (self.canCarryItem(itemData)) {
			// immediately consumable item doesn't require inventory space
			if (itemData.isUsedOnPickup && self.canUseItem(itemData)) {
				if (!isItemInstance) {
					item = new Item(itemData);
					item.script.trigger('entityCreated');
				}
				ige.devLog('using item immediately');
				item.setOwnerUnit(self);
				item.use();
				ige.game.lastCreatedItemId = item.id(); // this is necessary in case item isn't a new instance, but an existing item getting quantity updated
				return true;
			} else {
				// if designated item slot is already occupied, unit cannot get this item
				var availableSlot = self.inventory.getFirstAvailableSlotForItem(itemData);

				// Check if the item can merge
				if (itemData.controls == undefined || (itemData.controls.canMerge || itemData.controls.canMerge == undefined || itemData.controls.canMerge == null)) {
					// insert/merge itemData's quantity into matching items in the inventory
					var totalInventorySize = this.inventory.getTotalInventorySize();
					for (var i = 0; i < totalInventorySize; i++) {
						var matchingItemId = self._stats.itemIds[i];
						if (matchingItemId) {
							var matchingItem = ige.$(matchingItemId);

							// if a matching item found in the inventory, try merging them
							if (matchingItem && matchingItem._stats.itemTypeId == itemTypeId) {
								ige.game.lastCreatedItemId = matchingItem.id(); // this is necessary in case item isn't a new instance, but an existing item getting quantity updated

								// matching item has infinite quantity. merge item unless new item is also infinite
								if (matchingItem._stats.quantity == undefined && itemData.quantity != undefined) {
									if (isItemInstance) { // remove if it's an instance
										item.remove();
									}
									return true;
								}

								// the new item can fit in, because the matching item isn't full or has infinite quantity. Increase matching item's quantity only.
								if (
									itemData.quantity > 0 && (matchingItem._stats.maxQuantity - matchingItem._stats.quantity > 0)
								) {
									if (matchingItem._stats.maxQuantity != undefined) {
										var quantityToBeTakenFromItem = Math.min(itemData.quantity, matchingItem._stats.maxQuantity - matchingItem._stats.quantity);
									} else {
										// var quantityToBeTakenFromItem = itemData.quantity;
										// if matching item has infinite quantity, do not take any quantity from the new item
										var quantityToBeTakenFromItem = 0;
									}

									matchingItem.streamUpdateData([{ quantity: matchingItem._stats.quantity + quantityToBeTakenFromItem }]);
									itemData.quantity -= quantityToBeTakenFromItem;
								}
							}

							// if the new item no longer has any quantity left, destroy it (if it's an instance).
							if (itemData.maxQuantity != 0 && itemData.quantity == 0) {
								if (isItemInstance) {
									item.remove();
								}
								return true;
							}
						}
					}
				}

				if (availableSlot != undefined) {
					if (!isItemInstance) {
						// itemData.stateId = (availableSlot-1 == this._stats.currentItemIndex) ? 'selected' : 'unselected';
						item = new Item(itemData);
						ige.game.lastCreatedItemId = item._id;
						item.script.trigger('entityCreated');
					}

					var slotIndex = availableSlot - 1;

					// Item
					item.streamUpdateData([
						{ ownerUnitId: self.id() },
						{ quantity: itemData.quantity },
						{ slotIndex: slotIndex }
					]);

					self.inventory.insertItem(item, availableSlot - 1);

					if (slotIndex == self._stats.currentItemIndex) {
						item.setState('selected');
					} else {
						item.setState('unselected');
					}

					// Unit
					self.streamUpdateData([{ itemIds: self._stats.itemIds }]);

					if (item._stats.bonus && item._stats.bonus.passive) {
						if (item._stats.slotIndex < self._stats.inventorySize || item._stats.bonus.passive.isDisabledInBackpack != true) {
							self.updateStats(item.id());
						}
					} else {
						self.updateStats(item.id());
					}

					this.setCurrentItem(); // this MUST come after item.streamUpdateData

					ige.game.lastCreatedItemId = item.id(); // this is necessary in case item isn't a new instance, but an existing item getting quantity updated

					return true;
				} else {
					return false;
				}
			}
		}
	},

	canCarryItem: function (itemData) {
		return itemData && (
			(!itemData.carriedBy || itemData.carriedBy.length == 0) ||// carried by everyone
			(itemData.carriedBy && itemData.carriedBy.indexOf(this._stats.type) > -1) // carried by specific unit
		);
	},

	canUseItem: function (itemData) {
		return itemData && (
			(!itemData.canBeUsedBy || itemData.canBeUsedBy.length == 0) || // used by everyone
			(itemData.canBeUsedBy && itemData.canBeUsedBy.indexOf(this._stats.type) > -1) // used by specific unit
		);
	},

	// destroy the existing name label of this unit, and crate a new name label using unit's owner player's name.
	// if this unit is hostile to my player (viewing player), and unit is either invisible or is suppose to have its name hidden, then don't show the name
	updateNameLabel: function () {
		var self = this;
		var ownerPlayer = self.getOwner();
		var playerTypeData = ownerPlayer && ige.game.getAsset('playerTypes', ownerPlayer._stats.playerTypeId);

		// label should be hidden
		var hideLabel = (
			ownerPlayer &&
			ownerPlayer.isHostileTo(ige.client.myPlayer) &&
			self._stats.isNameLabelHidden
		) || (
			ownerPlayer &&
			ownerPlayer.isFriendlyTo(ige.client.myPlayer) &&
			self._stats.isNameLabelHiddenToFriendly
		) || (
			ownerPlayer &&
			ownerPlayer.isNeutralTo(ige.client.myPlayer) &&
			self._stats.isNameLabelHiddenToNeutral
		) || (
			// for AI x players we ont have playerTypeData as they dont have playerTypeId fields
			playerTypeData
				? playerTypeData.showNameLabel === false
				: true
		) || (
			!ige.client.myPlayer ||
			ige.client.myPlayer._stats.playerJoined === false
		);

		if (hideLabel) {
			this.emit('hide-label');
			return;
		}

		var color = '#FFFFFF';
		var isMyUnit = ige.network.id() == self._stats.clientId;

		if (ownerPlayer) {
			color = playerTypeData && playerTypeData.color;
		}
		// if (isMyUnit) {
		//     color = '#99FF00';
		// }

		this.emit('update-label', {
			text: self._stats.name,
			bold: isMyUnit,
			color: color
		});
	},

	// destroy the existing name label of this unit, and crate a new name label using unit's owner player's name.
	// if this unit is hostile to my player (viewing player), and unit is either invisible or is suppose to have its name hidden, then don't show the name
	updateFadingText: function (text, color) {
		var self = this;
		var ownerPlayer = self.getOwner();
		var playerTypeData = ownerPlayer && ige.game.getAsset('playerTypes', ownerPlayer._stats.playerTypeId);

		// label should be hidden
		var hideLabel = (
			ownerPlayer &&
			ownerPlayer.isHostileTo(ige.client.myPlayer) &&
			self._stats.isNameLabelHidden
		) || (
			ownerPlayer &&
			ownerPlayer.isFriendlyTo(ige.client.myPlayer) &&
			self._stats.isNameLabelHiddenToFriendly
		) || (
			ownerPlayer &&
			ownerPlayer.isNeutralTo(ige.client.myPlayer) &&
			self._stats.isNameLabelHiddenToNeutral
		) || (
			!ige.client.myPlayer ||
			ige.client.myPlayer._stats.playerJoined === false
		);

		if (hideLabel) {
			return;
		}

		var DEFAULT_COLOR = 'white';
		var shouldBeBold = ige.network.id() == self._stats.clientId;
		var isQueueProcessorRunning = !!self._stats.fadingTextQueue.length;

		self._stats.fadingTextQueue.push({
			text: text,
			color: color
		});

		if (!isQueueProcessorRunning) {
			var queueProcessor = setInterval(function () {
				if (!self._stats.fadingTextQueue.length) {
					return clearInterval(queueProcessor);
				}

				// var id = self.fadingLabel && self.fadingLabel.id();
				var highestDepth = 6;

				for (var i = 0; i < self._stats.fadingTextQueue.length; i++) {
					var fadingTextConfig = self._stats.fadingTextQueue.shift();

					self.emit('fading-text', {
						text: fadingTextConfig.text,
						color: fadingTextConfig.color || DEFAULT_COLOR
					});
				}
			}, 300);
		}
	},

	dropItem: function (itemIndex) {
		// Unit.prototype.log("dropItem " + itemIndex)
		// console.log(`running Unit.dropItem(${itemIndex}) on ${ige.isClient ? 'Client' : 'Server'}`);
		var self = this;
		var item = self.inventory.getItemBySlotNumber(itemIndex + 1);
		if (item) {
			
			// check if item's undroppable
			if (item._stats && item._stats.controls && item._stats.controls.undroppable) {
				return;
			}

			if (ige.isServer) {
				item.stopUsing();
				// give it a body (cuz it's dropped)
				// if item is already being held, then simply detach it
				var owner = item.getOwnerUnit();
				item.oldOwnerId = owner.id();

				var defaultData = {
					translate: {
						x: this._translate.x + item.anchoredOffset.x,
						y: this._translate.y + item.anchoredOffset.y
					},
					rotate: item._rotate.z
				};

				if (ige.physics.engine === 'CRASH') {
					item.crashBody.pos.x = defaultData.translate.x;
					item.crashBody.pos.y = defaultData.translate.y;
					item._translate.x = defaultData.translate.x;
					item._translate.y = defaultData.translate.y;
					item.crashActive(true);
					/*item._hasMoved = true;
					item._translateTo(defaultData.translate.x, defaultData.translate.y)*/
				}

				item.setOwnerUnit(undefined);
				item.setState('dropped', defaultData);				

				if (item._stats.hidden) {
					item.streamUpdateData([{ hidden: false }]);
				}

				self.inventory.removeItem(itemIndex, item.id());

				this.setCurrentItem();

				if (item._stats.bonus && item._stats.bonus.passive) {
					if (item._stats.slotIndex < this._stats.inventorySize || item._stats.bonus.passive.isDisabledInBackpack != true) {
						self.updateStats(item.id(), true);
					}
				} else {
					self.updateStats(item.id(), true);
				}

				self.detachEntity(item.id()); // igeEntityPhysics comment: not working right now

				ige.queueTrigger('unitDroppedAnItem', {
					itemId: item.id(),
					unitId: self.id()
				});
			}
		}

		return item;
	},

	getCurrentItem: function () {
		// return this.inventory.getItemBySlotNumber(this._stats.currentItemIndex + 1);
		return ige.$(this._stats.currentItemId);
	},

	// make this unit go owie
	inflictDamage: function (damageData) {
		var self = this;
		// only unit can be damaged
		if (damageData) {
			var targetPlayer = this.getOwner();
			var sourcePlayer = ige.$(damageData.sourcePlayerId);
			var sourceUnit = ige.$(damageData.sourceUnitId);
			var inflictDamage = false;

			var targetsAffected = damageData.targetsAffected;
			if (
				sourcePlayer && targetPlayer && sourcePlayer != targetPlayer &&
				(
					targetsAffected == undefined || // attacks everything
					(targetsAffected.constructor === Array && targetsAffected.length == 0) || // attacks everything
					targetsAffected.includes('everything') || // attacks everything - obsolete, but included for backward compatibility
					(targetsAffected.includes('hostile') && sourcePlayer.isHostileTo(targetPlayer)) ||
					(targetsAffected.includes('friendly') && sourcePlayer.isFriendlyTo(targetPlayer)) ||
					(targetsAffected.includes('neutral') && sourcePlayer.isNeutralTo(targetPlayer))
				)
			) {
				inflictDamage = true;
			}

			if (inflictDamage) {
				ige.game.lastAttackingUnitId = damageData.sourceUnitId;
				ige.game.lastAttackedUnitId = this.id();
				ige.game.lastAttackingItemId = damageData.sourceItemId;
				this.lastAttackedBy = sourceUnit;

				if (ige.isClient) {
					this.playEffect('attacked');
					return true;
				}

				var triggeredBy = {
					unitId: ige.game.lastAttackingUnitId,
					itemId: ige.game.lastAttackingItemId
				};

				ige.script.trigger('unitAttacksUnit', triggeredBy);
				this.script.trigger('entityGetsAttacked', triggeredBy);

				var armor = this._stats.attributes.armor && this._stats.attributes.armor.value || 0;
				var damageReduction = (0.05 * armor) / (1.5 + 0.04 * armor);
				var ownerUnitBaseDamage = (sourceUnit != undefined) ? sourceUnit.getBaseDamage() : 0;

				// update target unit's attributes (e.g. lower the target unit's hp)
				if (damageData.unitAttributes) {
					_.forEach(damageData.unitAttributes, function (damageValue, damageAttrKey) {
						var attribute = self._stats.attributes[damageAttrKey];
						if (attribute) {
							if (damageAttrKey == 'health') {
								damageValue += ownerUnitBaseDamage;
							}
							damageValue *= 1 - damageReduction;
							var newValue = (attribute.value || 0) - (damageValue || 0);
							self.attribute.update(damageAttrKey, newValue, true);
						}
					});
				}

				// update target unit's owner's attributes (e.g. lower the owner player's score)
				if (damageData.playerAttributes && targetPlayer && targetPlayer._stats.attributes) {
					_.forEach(damageData.playerAttributes, function (damageValue, damageAttrKey) {
						var attribute = targetPlayer._stats.attributes[damageAttrKey];
						if (attribute) {
							damageValue *= 1 - damageReduction;
							var newValue = (attribute.value || 0) - (damageValue || 0);
							targetPlayer.attribute.update(damageAttrKey, newValue, true);
						}
					});
				}

				if (self._stats.ai && self._stats.aiEnabled) {
					self.ai.registerAttack(sourceUnit);
				}

				return true;
			}
		}
		return false;
	},

	remove: function () {
		var self = this;
		clearInterval(self.contactLoop);

		var ownerPlayer = self.getOwner();

		// remove this unit from its owner player's unitIds
		if (ownerPlayer) {
			ownerPlayer.disownUnit(self);
		}

		if (ige.isClient) {

			if (ige.client.cameraTrackUnitId == self.id()) {
				ige.client.cameraTrackUnitId = undefined;
			}

			if (self.minimapUnit) {
				self.minimapUnit.destroy();
				delete self.minimapUnit;
			}
		}

		if (this.sensor) {
			this.sensor.remove();
		}

		// destroy all items in inventory
		if (self._stats.itemIds) {
			for (var i = 0; i < self._stats.itemIds.length; i++) {
				var currentItem = this.inventory.getItemBySlotNumber(i + 1);
				if (currentItem && currentItem.getOwnerUnit() == this) {
					currentItem.remove();
				}
			}
		}

		IgeEntityPhysics.prototype.remove.call(this);
	},

	queueStreamData: function(streamData) {
		if (ige.isServer) {
			IgeEntity.prototype.queueStreamData.call(this, streamData);	
		}
	},

	// update unit's stats in the server side first, then update client side as well.
	streamUpdateData: function (queuedData) {
		var self = this;
		// Unit.prototype.log("unit streamUpdateData", data)

		// if (ige.isServer && ige.network.isPaused) 
		// 	return;

		IgeEntity.prototype.streamUpdateData.call(this, queuedData);

		for (var i = 0; i < queuedData.length; i++) {
			var data = queuedData[i];
			for (attrName in data) {
				var newValue = data[attrName];

				switch (attrName) {
					case 'type':
						self._stats[attrName] = newValue;
						this.changeUnitType(newValue, {}, false);
						break;

					case 'aiEnabled':
						self._stats[attrName] = newValue;
						if (ige.isClient) {
							if (newValue == true) {
								self.ai.enable();
							} else {
								self.ai.disable();
							}
						}
						break;

					case 'itemIds':
						self._stats[attrName] = newValue;
						// update shop as player points are changed and when shop modal is open
						if (ige.isClient) {
							this.inventory.update();

							if ($('#modd-item-shop-modal').hasClass('show')) {
								ige.shop.openItemShop();
							}

							// console.log('Unit.streamUpdateData(\'itemIds\') on the client', newValue);
							this.setCurrentItem();
						}
						break;

					case 'currentItemIndex':
						self._stats[attrName] = newValue;
						// for tracking selected index of other units
						if (ige.isClient && this !== ige.client.selectedUnit) {
							// console.log('Unit.streamUpdateData(\'currentItemIndex\') on the client', newValue);
							this.setCurrentItem(newValue);
						}
						break;

					case 'skin':
					case 'isInvisible':
					case 'isInvisibleToFriendly':
					case 'isInvisibleToNeutral':
						self._stats[attrName] = newValue;
						if (ige.isClient) {
							this.updateTexture();
						}
						break;

					case 'scale':
						self._stats[attrName] = newValue;
						if (ige.isClient) {
							self._scaleTexture();
						}
						break;

					case 'scaleBody':
						self._stats[attrName] = newValue;
						if (ige.isServer) {
							// finding all attach entities before changing body dimensions
							if (self.jointsAttached) {
								var attachedEntities = {};
								for (var entityId in self.jointsAttached) {
									var entity = self.jointsAttached[entityId];
									if (entityId != self.id()) {
										attachedEntities[entityId] = true;
									}
								}
							}

							// changing body dimensions
							self._scaleBox2dBody(newValue);

						} else if (ige.isClient) {
							self._stats.scale = newValue;
							self._scaleTexture();
						}
						break;
					case 'isNameLabelHidden':
					case 'isNameLabelHiddenToNeutral':
					case 'isNameLabelHiddenToFriendly':
					case 'name':
						self._stats.name = newValue;
						// updating stats bcz setOwner is replacing stats.
						if (ige.isClient) {
							self.updateNameLabel();
						}

						break;
					case 'isHidden':
						self._stats[attrName] = newValue;
						if (ige.isClient) {
							if (newValue == true) {
								self.hide();
							} else {
								self.show();
							}
						}
						break;

					case 'setFadingText':
						self._stats[attrName] = newValue;
						if (ige.isClient) {
							newValue = newValue.split('|-|');
							self.updateFadingText(newValue[0], newValue[1]);
						}
						break;
					case 'ownerPlayerId':
						self._stats[attrName] = newValue;
						if (ige.isClient) {
							self.setOwnerPlayer(newValue);
						}
						break;
				}


			}
		}
	},

	tick: function (ctx) {
		if (ige.isClient && !ige.client.unitRenderEnabled) return;
		IgeEntity.prototype.tick.call(this, ctx);
	},

	// apply texture based on state
	updateTexture: function () {
		var self = this;
		var defaultUnit = ige.game.getAsset('unitTypes', self._stats.type);
		var changeTextureType;
		if (self._stats.cellSheet.url !== defaultUnit.cellSheet.url) {
			changeTextureType = 'using_skin'
		} else {
			changeTextureType = 'normal'
		}
		self.emit('update-texture', changeTextureType);

		var ownerPlayer = self.getOwner();
		var isInvisible = self.shouldBeInvisible(ownerPlayer, ige.client.myPlayer);
		// if owner player is not available (due to race condition) then render everything or it is hostile and player is invisible them make unit invisible to hostile players. it can still move and interact with objects
		if (isInvisible) {
			// unit is invisible
			self.texture('');
			return;
		}

		IgeEntity.prototype.updateTexture.call(this);
	},

	equipSkin: function (equipPurchasable) {
		var self = this;
		var owner = this.getOwner();
		if (ige.isClient) {
			if (owner && owner._stats && owner._stats.purchasables && owner._stats.purchasables.length > 0) {
				owner._stats.purchasables.forEach(function (purchasable) {
					if (purchasable && purchasable.target && purchasable.target.entityType === 'unit' && purchasable.target.key === (self._stats.type)) {
						var defaultUnit = ige.game.getAsset('unitTypes', self._stats.type);

						if (self._stats.clientId === ige.network.id() && window.adBlockEnabled && defaultUnit.cellSheet.url !== purchasable.image) {
							notifyAboutAdblocker(2);
							$('#modd-shop-modal').modal('hide');
						} else {
							if (purchasable.image && purchasable.image.indexOf('cdn.discordapp.com') === -1) {
								self._stats.cellSheet.url = purchasable.image;
							}
						}
					}
				});
			}
			self.updateTexture();
		} else if (ige.isServer) {
			const requestedPurchasable = owner._stats.allPurchasables ? owner._stats.allPurchasables.find((purchasable) => equipPurchasable._id === purchasable._id) : null;
			if (!requestedPurchasable || !requestedPurchasable.image) {
				// requested purchasable does not exist or player does not have access to it.
				return;
			}
			// overwrite purchasable image sent via client to avoid skin exploits
			equipPurchasable.image = requestedPurchasable.image;

			self._stats.cellSheet.url = equipPurchasable.image;
			if (!owner._stats.purchasables || !(owner._stats.purchasables instanceof Array)) owner._stats.purchasables = [];
			var index = owner._stats.purchasables.findIndex(function (purchasable) {
				if (purchasable.type === equipPurchasable.type) return true;
			});
			if (index > -1) {
				owner._stats.purchasables.splice(index, 1);
			}
			var purchasables = _.cloneDeep(owner._stats.purchasables);
			equipPurchasable = _.pick(equipPurchasable, ['_id', 'image', 'owner', 'target', 'type']);
			purchasables.push(equipPurchasable);
			owner.streamUpdateData([
				{ purchasables: purchasables },
				{ equiped: true }
			]);
		}
	},

	unEquipSkin: function (unEquipedId, forceFullyUnequip, cellSheetUrl) {
		var self = this;
		var defaultUnit = ige.game.getAsset('unitTypes', self._stats.type);
		var owner = this.getOwner();
		if (ige.isServer) {
			if (owner && owner._stats && owner._stats.purchasables && owner._stats.purchasables.length > 0) {
				var index = owner._stats.purchasables.findIndex(function (purchasable) {
					if (unEquipedId === purchasable._id) {
						cellSheetUrl = purchasable.image;
						return true;
					}
				});
				var purchasables = _.cloneDeep(owner._stats.purchasables);
				if (index > -1) {
					purchasables.splice(index, 1);
					owner.streamUpdateData([
						{ purchasables: purchasables },
						{ unEquiped: cellSheetUrl }
					]);
				}
			}
		} else if (ige.isClient) {
			if (cellSheetUrl === self._stats.cellSheet.url || forceFullyUnequip) {
				self._stats.cellSheet.url = defaultUnit.cellSheet.url;
			}
			self.updateTexture();
		}
	},

	// Parth what does this do? -- Jaeyun
	// loadPersistedData , persistent
	loadPersistentData: function () {
		var self = this;
		var owner = self.getOwner();
		var persistedData = _.cloneDeep(owner.persistedData);
		if (persistedData && persistedData.data && persistedData.data.unit) {
			IgeEntity.prototype.loadPersistentData.call(this, persistedData.data.unit);

			var persistedInventoryItems = persistedData.data.unit.inventoryItems;
			for (var i = 0; i < persistedInventoryItems.length; i++) {
				var persistedItem = persistedInventoryItems[i];
				if (persistedItem) {
					var itemData = ige.game.getAsset('itemTypes', persistedItem.itemTypeId);
					if (itemData) {
						itemData.quantity = persistedItem.quantity;
						itemData.itemTypeId = persistedItem.itemTypeId;
						if (self.pickUpItem(itemData)) {
							var givenItem = ige.$(ige.game.lastCreatedItemId);
							if (givenItem && givenItem.getOwnerUnit() == this) {
								givenItem.loadPersistentData(persistedItem);
							}
						}
					}
				}
			}
		}
		self.persistentDataLoaded = true;
	},

	loadDataFromString: function (data) {
		var self = this;
		var owner = self.getOwner();
		var persistedData = _.cloneDeep(data);
		if (persistedData) {
			IgeEntity.prototype.loadPersistentData.call(this, persistedData);

			var persistedInventoryItems = persistedData.inventoryItems;
			for (var i = 0; i < persistedInventoryItems.length; i++) {
				var persistedItem = persistedInventoryItems[i];
				if (persistedItem) {
					var itemData = ige.game.getAsset('itemTypes', persistedItem.itemTypeId);
					if (itemData) {
						itemData.quantity = persistedItem.quantity;
						itemData.itemTypeId = persistedItem.itemTypeId;
						if (self.pickUpItem(itemData)) {
							var givenItem = ige.$(ige.game.lastCreatedItemId);
							if (givenItem && givenItem.getOwnerUnit() == this) {
								givenItem.loadPersistentData(persistedItem);
							}
						}
					}
				}
			}
		}
		self.persistentDataLoaded = true;
	},

	/*
	 * called from:
	 * Unit.streamUpdateData on Client: 'itemIds', 'currentItemIndex' for units not 'mine'
	 * Unit.changeItem on Server, Client
	 * Unit.pickupItem on Server, Client - appears to only run on server for keypressed abilities
	 * Unit.dropItem on Server - no client logic
	 * Inventory.removeItem calls streamUpdateData(itemIds) from server
	*/
	setCurrentItem: function (itemIndex) {
		// if param itemIndex is provided, use it to set index
		if (itemIndex !== undefined) {
			// set the _stats property for index when currentItemIndex changes
			this._stats.currentItemIndex = itemIndex;
		}
		const currentItemIndex = this._stats.currentItemIndex;
		// independent of currentItemIndex change, set currentItem. null is empty slot
		// use currentItem to set the _stats property for currentItemId
		// important for item drop/pickup/remove
		const currentItem = ige.$(this._stats.itemIds[currentItemIndex]) || null;
		this._stats.currentItemId = currentItem ? currentItem.id() : null;

		// client log of item state after pickup will still show 'dropped'. Currently state has not finished updating. It IS 'selected'/'unselected'

		// const debugMap = this._stats.itemIds.map((x) => {
		// 	const item = ige.$(x) || null;
		// 	const state = item ? item._stats.stateId : null;
		// 	return {
		// 		id: x,
		// 		item: item,
		// 		state: state,
		// 	};
		// });
		// console.log(
		// 	`running Unit.setCurrentItem(${itemIndex ? itemIndex : ''}) on ${ige.isClient ? 'Client' : 'Server'}\n`,
		// 	`this._stats.currentItemIndex: ${this._stats.currentItemIndex}\n`,
		// 	`this._stats.currentItemId: ${this._stats.currentItemId}\n`,
		// 	this.id(),
		// 	'\n',
		// 	debugMap
		// );
	},

	startMoving: function () {
		if (!this.isMoving) {
			this.playEffect('move');
			this.isMoving = true;

		}
	},

	stopMoving: function () {
		if (this.isMoving) {
			this.playEffect('idle');
			this.isMoving = false;
		}

		// this.direction.x = 0;
		// this.direction.y = 0;
	},

	updateAngleToTarget: function() {

		var ownerPlayer = this.getOwner();
		if (ownerPlayer) {

			// mobile control: rotate to rotation provided by the client
			if (this._stats.controls && this._stats.controls.absoluteRotation) {
				this.angleToTarget = ownerPlayer.absoluteAngle;

			// desktop control: if this unit's not under a command, rotate to mouse xy coordinate
			} else {
				var mouse = ownerPlayer.control.input.mouse;
				if (mouse) {
					var a = this._translate.x - mouse.x;
					var b = this._translate.y - mouse.y;
					this.distanceToTarget = Math.sqrt(a * a + b * b);
					this.angleToTarget = Math.atan2(mouse.y - this._translate.y, mouse.x - this._translate.x) + Math.radians(90);
				}
			}
		}
	},

	/**
	 * Called every frame by the engine when this entity is mounted to the
	 * scenegraph.
	 * @param ctx The canvas context to render to.
	 */
	_behaviour: function (ctx) {
		var self = this;

		_.forEach(ige.triggersQueued, function (trigger) {
			trigger.params['thisEntityId'] = self.id();
			self.script.trigger(trigger.name, trigger.params);
		});

		if (ige.isServer || (ige.isClient && ige.client.selectedUnit == this)) {

			// translate unit
			var speed = (this._stats.attributes && this._stats.attributes.speed && this._stats.attributes.speed.value) || 0;
			var vector = {x: 0, y: 0};

			// update rotation on server
			var ownerPlayer = self.getOwner();
			if (ownerPlayer) {

				// server-side unit rotation update
				if (ige.isServer) {

					if (!self._stats.aiEnabled && ownerPlayer._stats.controlledBy == 'human' && ownerPlayer.getSelectedUnit() == this) {
						self.updateAngleToTarget();
					}

					// rotate unit if angleToTarget is set
					if (self.angleToTarget != undefined && !isNaN(self.angleToTarget) &&
						this._stats.controls && this._stats.controls.mouseBehaviour.rotateToFaceMouseCursor &&
						this._stats.currentBody && !this._stats.currentBody.fixedRotation
					) {
						self.rotateTo(0, 0, self.angleToTarget);
					}
				}

				if (
					( // either unit is AI unit that is currently moving
						self._stats.aiEnabled && self.isMoving
					) ||
					( // or human player's unit that's "following cursor"
						!self._stats.aiEnabled &&
						self._stats.controls && self._stats.controls.movementControlScheme == 'followCursor' &&
						self.distanceToTarget > this.width() // if mouse cursor is close to the unit, then don't move
					)
				) {
					if (self.angleToTarget != undefined && !isNaN(self.angleToTarget)) {
						vector = {
							x: (speed * Math.sin(self.angleToTarget)),
							y: -(speed * Math.cos(self.angleToTarget))
						};
					}
				} else if (self.direction.x != 0 || self.direction.y != 0) {
					// disengage ai movement if a directional movement key's pressed
					self.ai.targetPosition = undefined;
					self.ai.targetUnitId = undefined;

					// moving diagonally should reduce speed
					if (self.direction.x != 0 && self.direction.y != 0) {
						speed = speed / 1.41421356237;
					}

					vector = {
						x: self.direction.x * speed,
						y: self.direction.y * speed
					};
				}

				// update AI
				if (self._stats.aiEnabled) {
					self.distanceToTarget = self.ai.getDistanceToTarget();
					self.ai.update();
				}

				if (ownerPlayer._stats.controlledBy == 'human' && !this._stats.aiEnabled) {
					// toggle effects when unit starts/stops moving
					if (!this.isMoving && (self.direction.x != 0 || self.direction.y != 0)) {
						this.startMoving();
					} else if (this.isMoving && self.direction.x === 0 && self.direction.y ===0) {
						this.stopMoving();
					}
				}

				ige.unitBehaviourCount++; // for debugging
				// apply movement if it's either human-controlled unit, or ai unit that's currently moving
				if (self.body && vector && (vector.x != 0 || vector.y != 0)) {
					// console.log('unit movement 2', vector);
					if (self._stats.controls) {
						switch (self._stats.controls.movementMethod) { // velocity-based movement
							case 'velocity':
								self.setLinearVelocity(vector.x, vector.y);
								break;
							case 'force':
								self.applyForce(vector.x, vector.y);
								break;
							case 'impulse':
								self.applyImpulse(vector.x, vector.y);
								break;
						}
					}
				}
			}

			// flip unit
			if (this._stats.controls && this._stats.controls.mouseBehaviour.flipSpriteHorizontallyWRTMouse && self.angleToTarget != undefined) {
				if (self.angleToTarget > 0 && self.angleToTarget < Math.PI) {
					self.flip(0);
				} else {
					self.flip(1);
				}
			}
		}

		if (ige.isClient) {
			// make minimap unit follow the unit
			if (self.minimapUnit) {
				self.minimapUnit.translateTo(self._translate.x, self._translate.y, 0);
			}

			if (this.isPlayingSound) {
				this.isPlayingSound.volume = ige.sound.getVolume(this._translate, this.isPlayingSound.effect.volume);
			}
		}

		// if entity (unit/item/player/projectile) has attribute, run regenerate
		if (ige.isServer || (ige.physics && ige.isClient && ige.client.selectedUnit == this && ige.game.cspEnabled)) {
			if (this._stats.buffs && this._stats.buffs.length > 0) {
				for (let i = 0; i < this._stats.buffs.length; i++) {
					var buff = this._stats.buffs[i];
					if (buff.timeLimit < Date.now()) {
						this.removeAttributeBuff(buff.attrId, buff.value, i);
					}
				}
			}
			if (this.attribute) {
				this.attribute.regenerate();
			}
		}

		if (ige.physics && ige.physics.engine != 'CRASH') {
			this.processBox2dQueue();
		}
	},

	destroy: function () {
		if (this.attributeBars) {
			for (var attributeBarInfo of this.attributeBars) {
				var unitBarId = attributeBarInfo.id;
				var unitBar = ige.$(unitBarId);
				unitBar.destroy();
			}
			this.attributeBars.length = 0;
			this.attributeBars = null;
		}
		this.playEffect('destroy');
		IgeEntityPhysics.prototype.destroy.call(this);
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = Unit;
}
