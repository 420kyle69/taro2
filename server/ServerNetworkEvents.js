var ServerNetworkEvents = {

	/**
	 * Is called when the network tells us a new client has connected
	 * to the server. This is the point we can return true to reject
	 * the client connection if we wanted to.
	 * @param data The data object that contains any data sent from the client.
	 * @param clientId The client id of the client that sent the message.
	 * @private
	 */

	_onClientConnect: function (socket) {
		// Tell the client to track their player entity
		// Don't reject the client connection
		var clientId = socket.id;
		console.log('3. _onClientConnect ' + clientId + ' (ip: ' + socket._remoteAddress + ') client count: ' + Object.keys(taro.server.clients).length, '(ServerNetworkEvents.js)');

		taro.server.clients[clientId] = {
			id: clientId,
			socket: socket,
			ip: socket._remoteAddress
		};

		taro.server.clients[clientId].lastEventAt = Date.now();

		taro.server.testerId = clientId;
	},

	_onClientDisconnect: function ({clientId, reason}) {
		var self = this;

		if (!reason) {
			// socket already disconnected, why sending clientDisconnect command then?
			taro.network.send('clientDisconnect', { reason: 'Player disconnected', clientId: clientId }, clientId);
		}
		
		// remove client from streamData
		for (entityId in taro.network.stream._streamClientCreated) {
			delete taro.network.stream._streamClientCreated[entityId][clientId];
		}

		var client = taro.server.clients[clientId];
		var player = taro.game.getPlayerByClientId(clientId);

		if (client && client._id) {
			taro.devLog('BE(out): clientDisconnect: ' + clientId + ' ' + client._id);

			if (player) {
				console.log('_onclientDisconnect' + clientId + ' (' + player._stats.name + ')' + (Date.now() - client.lastEventAt));
				player.updatePlayerHighscore();

				if (player._stats.userId) {
					taro.clusterClient.saveLastPlayedTime(player._stats.userId);
				}
			}
		}

		if (player) {
			player.remove();
		}
	},

	_onJoinGameWrapper: function (data, clientId) {

		var reason = 'IP banned.';
		var client = taro.server.clients[clientId];
		var socket = taro.network._socketById[clientId];
		if (client) {
			var ipAddress = client.ip;

			var removeAllConnectedPlayerWithSameIp = function () {
				var getAllPlayers = true;
				var players = taro.game.getPlayerByIp(ipAddress, undefined, getAllPlayers);
				players.forEach((player) => {
					if (player) {
						player.remove();
						var ps = taro.network._socketById[player._stats.clientId];
						ps && ps.close(reason);
					}
				});
			}

			if (taro.banIpsList.includes(ipAddress)) {
				removeAllConnectedPlayerWithSameIp();
				socket.close(reason);
				return;
			}

			taro.server._onJoinGame(data, clientId);
		}
	},

	_onJoinGame: function (data, clientId) {

		// assign _id and sessionID to the new client
		var client = taro.server.clients[clientId];
		var socket = taro.network._socketById[clientId];

		if (!socket) {
			try {
				global.rollbar.log('No socket found with this clientId',
					{
						data: data,
						clientId: clientId
					});
			} catch (error) {
				console.log(error);
			}
			return;
		}
		// check joining user is same as token user.
		else if ((socket._token.userId && socket._token.userId !== data._id) || (socket._token.sessionId && socket._token.sessionId !== data.sessionId)) {
			console.log('Unauthenticated user joining the game (ServerNetworkEvent.js)');
			socket.close('Unauthenticated user joining the game');
			return;
		}

		if (process.env.ENV === 'standalone' || process.env.ENV == 'standalone-remote') {
			delete data._id;
		}

		var logInfo = {};

		if (data._id) {
			logInfo._id = data._id;
		}

		if (client) {
			console.log('4. _onJoinGame ' + clientId + ' time elapsed: ' + (Date.now() - client.lastEventAt), '(ServerNetworkEvent.js)');
			client.lastEventAt = Date.now();
			client.receivedJoinGame = Date.now();
		}

		// assigning ip address to player stats
		data.ipAddress = client && client.ip;

		var currentClientIp = data.ipAddress;
		var isIpRestricted = taro.game.data.defaultData.banIps.find(function (obj) {
			if (obj.ip == currentClientIp) return true;
		});

		if (isIpRestricted) {
			console.log('IP is banned for ', clientId);
			var reason = 'Restricted IP detected.';
			taro.network.disconnect(clientId, reason);
			return;
		}

		// var ip = socket._remoteAddress;
		var playerWithDuplicateIP = taro.game.getPlayerByIp(currentClientIp, data._id);
		var maximumDuplicateIpsAllowed = 5;
		// if (playerWithDuplicateIP && playerWithDuplicateIP.getUnitCount() >= 1 && !(taro.game.data && taro.game.data.settings.allowDuplicateIPs)) {
		if (playerWithDuplicateIP && playerWithDuplicateIP.getUnitCount() >= maximumDuplicateIpsAllowed) {
			var reason = 'Duplicate IP detected. <br/>Please login to play the game <br/><a href="/?login=true" class="btn btn-primary">Login</a>';
			console.log('Duplicate IP ' + currentClientIp + ' detected for ' + clientId);
			taro.network.disconnect(clientId, reason);
			return;
		}

		// if user is logged-in
		if (data && data._id) {
			// if player already exists in the game
			var player = taro.game.getPlayerByUserId(data._id);

			//condition for menu open and click for play game button durring current play game.
			if (player && player._stats && clientId != player._stats.clientId) {
				console.log('Client already exists. Kicking the existing player ' + player._stats.clientId + ' (' + player._stats.name + ')');
				player.updatePlayerHighscore();
				var oldPlayerClientId = player._stats.clientId;
				
				taro.network.disconnect(oldPlayerClientId, 'User connected to another server.');

				delete taro.server.clients[oldPlayerClientId];

				//kicking player out of the game.
				player.remove();
			}

			//if player open menu during game play
			if (player && clientId == player._stats.clientId) {
				console.log('Player requested to join game ' + clientId + ' (' + player._stats.name + ')');
				player._stats.isAdBlockEnabled = data.isAdBlockEnabled;
				player.joinGame();
			}
			else {
				if (client) {
					client._id = data._id;

					if (data.sessionId) {
						client.sessionId = data.sessionId;
					}
				}

				console.log('request-user-data for ' + clientId + ' (user._id:' + data._id + ')');
				taro.clusterClient && taro.clusterClient.emit('request-user-data', data);
				if (process.env.ENV === 'standalone') {
					if (player == undefined) {
						var userData = {
							controlledBy: 'human',
							name: 'user' + (Math.floor(Math.random() * 999) + 100),
							points: 0,
							coins: 0,
							clientId: client._id,
							purchasables: {}
						};
						// console.log("createPlayer (logged-in user)")
						var player = taro.game.createPlayer();
						for (key in userData) {
							var obj = {};
							obj[key] = userData[key];
							data.push(obj);
						}
						player.joinGame();
						player.streamUpdateData(data);
					}
				}
			}

		}
		else // guest player
		{
			console.log('5. joining as a guest player (ServerNetworkEvents.js)');

			var socket = taro.network._socketById[clientId];
			if (socket) {
				let isAllowedToJoinGame = false;
				const roles = taro.game.data.roles || [];

				if (roles.length === 0 || roles.length === 1) {
					isAllowedToJoinGame = true;
				} else if (roles && roles.find((role) => role.type === 5 && role.permissions?.playGame)) {
					isAllowedToJoinGame = true;
				} 

				if (!isAllowedToJoinGame) {
					taro.network.disconnect(clientId, 'Guest players not allowed to join this game.');
					return;
				}

				// if this guest hasn't created player yet (hasn't joined the game yet)
				var player = taro.game.getPlayerByClientId(socket.id);

				if (player) {
					player._stats.isAdBlockEnabled = data.isAdBlockEnabled;
				} else {
					if (typeof data.number != 'number') {
						data.number = ' lol';
					}

					// console.log("createPlayer (guest user)")
					var player = taro.game.createPlayer({
						controlledBy: 'human',
						name: 'user' + data.number,
						coins: 0,
						points: 0,
						clientId: clientId,
						isAdBlockEnabled: data.isAdBlockEnabled
					});
				}

				player.joinGame();
			}
		}
	},


	_onBuySkin: function (skinHandle, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);
		if (player) {
			var unit = player.getSelectedUnit();
			if (
				unit &&
				taro.game.data.skins &&
				taro.game.data.skins[skinHandle] &&
				unit._stats.points >= taro.game.data.skins[skinHandle].price &&
				unit._stats.skin != skinHandle
			) {
				unit._stats.points -= taro.game.data.skins[skinHandle].price;
				unit._stats.skin = skinHandle;
				unit.updateTexture(skinHandle);

				taro.network.send('buySkin', skinHandle, clientId);
				unit.streamUpdateData([
					{ skin: unit._stats.skin },
					{ points: unit._stats.points }
				]);
			}
		}
	},

	_onTrade: function (msg, clientId) {
		switch (msg.type) {
			case 'start': {
				var requestedBy = taro.$(msg.requestedBy);
				var acceptedBy = taro.$(msg.acceptedBy);
				if (requestedBy && acceptedBy && requestedBy._category === 'player' && acceptedBy._category === 'player') {
					var tradeBetween = { playerA: requestedBy.id(), playerB: acceptedBy.id() };
					taro.network.send('trade', { type: 'start', between: tradeBetween }, requestedBy._stats.clientId);
					requestedBy.tradingWith = acceptedBy.id();
					requestedBy.isTrading = true;
					acceptedBy.tradingWith = requestedBy.id();
					acceptedBy.isTrading = true;
				}
				break;
			}
			case 'offer': {
				var from = taro.$(msg.from);
				var to = taro.$(msg.to);
				if (from && to && from._category === 'player' && from._category === 'player' && from.tradingWith === to.id()) {
					taro.network.send('trade', {
						type: 'offer',
						from: msg.from,
						to: msg.to,
						tradeItems: msg.tradeItems
					}, to._stats.clientId);
				}
				break;
			}
			case 'accept': {
				var acceptedBy = taro.$(msg.acceptedBy);
				var acceptedFor = taro.$(msg.acceptedFor);

				if (acceptedBy && acceptedFor) {
					if (!acceptedBy.acceptTrading) {
						taro.chat.sendToRoom('1', 'Trading has been accepted by ' + acceptedBy._stats.name, acceptedFor._stats.clientId);
					}
					if (acceptedBy.tradingWith === acceptedFor.id()) {
						acceptedBy.acceptTrading = true;
					}
					if (acceptedBy.acceptTrading && acceptedFor.acceptTrading) {
						var unitA = acceptedBy.getSelectedUnit();
						var unitB = acceptedFor.getSelectedUnit();
						var unitAInventorySize = unitA.inventory.getTotalInventorySize();
						var unitBInventorySize = unitB.inventory.getTotalInventorySize();
						var unitAItems = unitA._stats.itemIds.slice(unitAInventorySize, unitAInventorySize + 5);
						var unitBItems = unitB._stats.itemIds.slice(unitBInventorySize, unitBInventorySize + 5);
						var isTradingSuccessful = false;

						for (var i = 0; i < unitAItems.length; i++) {
							if (unitAItems[i]) {
								var item = taro.$(unitAItems[i]);
								unitA.dropItem(item._stats.slotIndex);
								isTradingSuccessful = unitB.pickUpItem(item);

								if (!isTradingSuccessful) {
									unitA.pickUpItem(item);
									break;
								}
							}
						}

						for (var i = 0; i < unitBItems.length; i++) {
							if (unitBItems[i]) {
								var item = taro.$(unitBItems[i]);
								unitB.dropItem(item._stats.slotIndex);
								isTradingSuccessful = unitA.pickUpItem(item);

								if (!isTradingSuccessful) {
									unitB.pickUpItem(item);
									break;
								}
							}
						}
						var tradeBetween = {
							playerA: msg.acceptedBy,
							playerB: msg.acceptedFor
						};

						if (!isTradingSuccessful) {
							taro.network.send('trade', { type: 'error', between: tradeBetween }, acceptedFor._stats.clientId);

							taro.network.send('trade', { type: 'error', between: tradeBetween }, acceptedBy._stats.clientId);
							return;
						}

						unitA.streamUpdateData([{ itemIds: unitA._stats.itemIds }]);
						unitB.streamUpdateData([{ itemIds: unitB._stats.itemIds }]);



						taro.network.send('trade', { type: 'success', between: tradeBetween }, acceptedFor._stats.clientId);

						taro.network.send('trade', { type: 'success', between: tradeBetween }, acceptedBy._stats.clientId);
						if (acceptedBy) {
							delete acceptedBy.isTrading;
							delete acceptedBy.tradingWith;
							delete acceptedBy.acceptTrading;
						}
						if (acceptedFor) {
							delete acceptedFor.isTrading;
							delete acceptedFor.tradingWith;
							delete acceptedFor.acceptTrading;
						}
					}
				}

				break;
			}
			case 'cancel': {
				var playerA = taro.$(msg.cancleBy);
				var playerB = taro.$(msg.cancleTo);
				if (playerA) {
					delete playerA.isTrading;
					delete playerA.tradingWith;
					delete playerA.acceptTrading;
				}
				if (playerB) {
					delete playerB.isTrading;
					delete playerB.tradingWith;
					delete playerB.acceptTrading;
				}

				var tradeBetween = { playerA: msg.cancleBy, playerB: msg.cancleTo };
				taro.network.send('trade', { type: 'cancel', between: tradeBetween }, playerB._stats.clientId);
				taro.chat.sendToRoom('1', 'Trading has been cancel by ' + playerA._stats.name, playerB._stats.clientId);

				var unitA = playerA.getSelectedUnit();
				if (unitA) {
					var unitAInventorySize = unitA.inventory.getTotalInventorySize();
					for (var i = unitAInventorySize; i < unitAInventorySize + 5; i++) {
						var offeringItemId = unitA._stats.itemIds[i];
						var item = offeringItemId && taro.$(offeringItemId);
						if (item && item._category === 'item') {
							var availSlot = unitA.inventory.getFirstAvailableSlotForItem(item);
							unitA._stats.itemIds[availSlot] = unitA._stats.itemIds[i];
							unitA._stats.itemIds[i] = undefined;
						}
					}
					// revert items for A unit
					unitA.streamUpdateData([{ itemIds: unitA._stats.itemIds }]);
				}

				var unitB = playerB.getSelectedUnit();
				if (unitB) {
					var unitBInventorySize = unitB.inventory.getTotalInventorySize();
					for (var i = unitBInventorySize; i < unitBInventorySize + 5; i++) {
						var offeringItemId = unitB._stats.itemIds[i];
						var item = offeringItemId && taro.$(offeringItemId);
						if (item && item._category === 'item') {
							var availSlot = unitB.inventory.getFirstAvailableSlotForItem(item);
							unitB._stats.itemIds[availSlot] = unitB._stats.itemIds[i];
							unitB._stats.itemIds[i] = undefined;
						}
					}
					// revert items for B unit
					unitB.streamUpdateData([{ itemIds: unitB._stats.itemIds }]);
				}
				break;
			}
		}
	},

	_onEditTile: function(data, clientId) {
		taro.developerMode.editTile(data, clientId);
	},

	_onEditRegion: function(data, clientId) {
		taro.developerMode.editRegion(data, clientId);
	},

	_onEditInitEntity: function(data, clientId) {
		taro.developerMode.editInitEntity(data, clientId);
	},

	_onRequestInitEntities: function(data, clientId) {
		taro.developerMode.requestInitEntities(data, clientId);
	},

	_onEditEntity: function(data, clientId) {
		taro.developerMode.editEntity(data, clientId);
	},

	_onBuyItem: function (data, clientId) {
		const {id, token} = data;
		taro.devLog('player ' + clientId + ' wants to purchase item' + id);

		var player = taro.game.getPlayerByClientId(clientId);
		if (player) {
			var unit = player.getSelectedUnit();
			if (unit) {
				unit.buyItem(id, token);
			}
		}
	},

	_onBuyUnit: function (id, clientId) {
		taro.devLog('player ' + clientId + ' wants to purchase item' + id);
		var player = taro.game.getPlayerByClientId(clientId);
		if (player) {
			var unit = player.getSelectedUnit();
			if (unit) {
				unit.buyUnit(id);
			}
		}
	},

	_onEquipSkin: function (equipPurchasable, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);
		if (player) {
			var unit = player.getSelectedUnit();
			if (unit) {
				unit.equipSkin(equipPurchasable);
			}
		}
	},

	_onSwapInventory: function (data, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);
		if (player) {
			var unit = player.getSelectedUnit();
			if (unit && unit._stats) {
				var itemIds = rfdc()(unit._stats.itemIds);
				var fromItem = taro.$(itemIds[data.from]);
				var toItem = taro.$(itemIds[data.to]);

				// both FROM & TO slots have items
				if (
					(fromItem && fromItem._stats) &&
					(toItem && toItem._stats)
				) {
					// merge
					// if (fromItem._stats.itemTypeId == toItem._stats.itemTypeId) {
					// 	var qtyToBeAdded = Math.min(toItem._stats.maxQuantity - toItem._stats.quantity, fromItem._stats.quantity)
					// 	if (qtyToBeAdded > 0) {
					// 		if (toItem)
					// 			toItem.updateQuantity(toItem._stats.quantity + qtyToBeAdded);
					// 		if (fromItem)
					// 			fromItem.updateQuantity(fromItem._stats.quantity - qtyToBeAdded);
					// 	}
					// 	return;
					// }

					// swap
					if (
						(
							fromItem._stats.controls == undefined ||
							fromItem._stats.controls.permittedInventorySlots == undefined ||
							fromItem._stats.controls.permittedInventorySlots.length == 0 ||
							fromItem._stats.controls.permittedInventorySlots.includes(data.to + 1) ||
							(data.to + 1 > unit._stats.inventorySize && (fromItem._stats.controls.backpackAllowed == true || fromItem._stats.controls.backpackAllowed == undefined || fromItem._stats.controls.backpackAllowed == null)) // any item can be moved into backpack slots if the backpackAllowed property is true
						) &&
						(
							toItem._stats.controls == undefined ||
							toItem._stats.controls.permittedInventorySlots == undefined ||
							toItem._stats.controls.permittedInventorySlots.length == 0 ||
							toItem._stats.controls.permittedInventorySlots.includes(data.from + 1) ||
							(data.from + 1 > unit._stats.inventorySize && (toItem._stats.controls.backpackAllowed == true || toItem._stats.controls.backpackAllowed == undefined || toItem._stats.controls.backpackAllowed == null)) // any item can be moved into backpack slots if the backpackAllowed property is true
						)
					) {
						fromItem.streamUpdateData([{ slotIndex: parseInt(data.to) }]);
						toItem.streamUpdateData([{ slotIndex: parseInt(data.from) }]);

						if (fromItem._stats.bonus && fromItem._stats.bonus.passive && fromItem._stats.bonus.passive.isDisabledInBackpack == true) {
							if (data.from + 1 <= unit._stats.inventorySize && data.to + 1 > unit._stats.inventorySize) {
								unit.updateStats(fromItem.id(), true);
							}
							else if (data.to + 1 <= unit._stats.inventorySize && data.from + 1 > unit._stats.inventorySize) {
								unit.updateStats(fromItem.id());
							}
						}

						if (toItem._stats.bonus && toItem._stats.bonus.passive && toItem._stats.bonus.passive.isDisabledInBackpack == true) {
							if (data.to + 1 <= unit._stats.inventorySize && data.from + 1 > unit._stats.inventorySize) {
								unit.updateStats(toItem.id(), true);
							}
							else if (data.from + 1 <= unit._stats.inventorySize && data.to + 1 > unit._stats.inventorySize) {
								unit.updateStats(toItem.id());
							}
						}

						var temp = itemIds[data.from];
						itemIds[data.from] = itemIds[data.to];
						itemIds[data.to] = temp;
					}
				}

				// TO slot doesn't have item
				if (
					fromItem != undefined &&
					toItem == undefined &&
					data.to < unit.inventory.getTotalInventorySize() &&
					(
						fromItem._stats.controls == undefined ||
						fromItem._stats.controls.permittedInventorySlots == undefined ||
						fromItem._stats.controls.permittedInventorySlots.length == 0 ||
						fromItem._stats.controls.permittedInventorySlots.includes(data.to + 1) ||
						(data.to + 1 > unit._stats.inventorySize && (fromItem._stats.controls.backpackAllowed == true || fromItem._stats.controls.backpackAllowed == undefined || fromItem._stats.controls.backpackAllowed == null)) // any item can be moved into backpack slots if the backpackAllowed property is true
					)
				) {
					fromItem.streamUpdateData([{ slotIndex: parseInt(data.to) }]);

					if (fromItem._stats.bonus && fromItem._stats.bonus.passive && fromItem._stats.bonus.passive.isDisabledInBackpack == true) {
						if (data.from + 1 <= unit._stats.inventorySize && data.to + 1 > unit._stats.inventorySize){
							unit.updateStats(fromItem.id(), true);
						}
						else if (data.to + 1 <= unit._stats.inventorySize && data.from + 1 > unit._stats.inventorySize) {
							unit.updateStats(fromItem.id());
						}
					}

					itemIds[data.to] = itemIds[data.from];
					itemIds[data.from] = undefined;
				}

				unit.streamUpdateData([{ itemIds: itemIds }]);
				unit.changeItem(unit._stats.currentItemIndex);
			}
		}
	},

	_onKick: function (kickedClientId, modClientId) {
		var modPlayer = taro.game.getPlayerByClientId(modClientId);
		var kickedPlayer = taro.game.getPlayerByClientId(kickedClientId);
		var message = "You were kicked";

		if (!modPlayer) {
			return;
		} else {
			var modPlayer = taro.$(modPlayerId);
			modPlayerName = modPlayer?._stats?.name;
			if (modPlayerName) {
				message = 'You were kicked by ' + modPlayerName;
			}
		}

		var isUserDeveloper = modPlayer.isDeveloper();

		if (isUserDeveloper && kickedPlayer) {
			taro.game.kickPlayer(kickedPlayer.id(), message);
		}
	},

	_onBanUser: function ({ userId, kickuserId }, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);

		if (!player) {
			return;
		}

		var isUserDeveloper = player.isDeveloper();

		if (isUserDeveloper) {
			var kickedPlayer = taro.$$('player').find(function (player) {
				if (player._stats && player._stats.clientId === kickuserId) return true;
			});
			kickedPlayer.streamUpdateData([{ playerJoined: false }]);
			taro.clusterClient.banUser({
				userId: userId
			});
		}
	},
	_onBanIp: function ({ gameId, kickuserId }, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);

		if (!player) {
			return;
		}

		var isUserDeveloper = player.isDeveloper();

		if (isUserDeveloper) {
			var kickedPlayer = taro.$$('player').find(function (player) {
				return player._stats && player._stats.clientId === kickuserId;
			});
			let ipaddress = null;
			let userId = null;
			for (let clientId in taro.server.clients) {
				if (clientId === kickuserId) {
					ipaddress = taro.server.clients[clientId].ip;
					userId = taro.server.clients[clientId]._id;
				}
			}

			kickedPlayer.streamUpdateData([{ playerJoined: false }]);

			if (ipaddress) {
				taro.clusterClient.banIp({
					ipaddress: ipaddress,
					gameId: gameId,
					userId: userId
				});
			}
		}
	},
	_onBanChat: function ({ gameId, kickuserId }, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);

		if (!player) {
			return;
		}

		var isUserDeveloper = player.isDeveloper();

		if (isUserDeveloper) {
			var banPlayer = taro.$$('player').find(function (player) {
				if (player._stats && player._stats.clientId === kickuserId) return true;
			});
			// kickedPlayer.streamUpdateData([{ playerJoined: false }]);

			taro.clusterClient.banChat({
				userId: banPlayer._stats.userId,
				gameId: gameId,
				status: !banPlayer._stats.banChat
			});

			banPlayer.streamUpdateData([{ banChat: !banPlayer._stats.banChat }]);
		}
	},
	_onUnEquipSkin: function (unEquipedId, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);

		if (!player) {
			return;
		}

		var unit = player.getSelectedUnit();
		if (unit) {
			unit.unEquipSkin(unEquipedId);
		}
	},

	_onPlayerMouseMoved: function (position, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);
		if (player) {
			var unit = player.getSelectedUnit();
			if (unit) {
				player.control.input.mouse.x = position[0];
				player.control.input.mouse.y = position[1];
			}
		}
	},

	_onPlayerUnitMoved: function (position, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);
		if (player) {
			var unit = player.getSelectedUnit();
			if (unit) {
				unit.clientStreamedPosition = position;
			}
		}
	},

	_onPlayerCustomInput: function (data, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);
		if (player && data && data.status === 'submitted') {
			player.lastCustomInput = data.inputText;
			taro.script.trigger('playerCustomInput', { playerId: player.id() });
		}
	},
	_onPlayerAbsoluteAngle: function (data, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);
		if (player) {
			player.absoluteAngle = data;
		}
	},
	_onPlayerDialogueSubmit: function (data, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);

		if (player) {
			var selectedOption = null;

			for (var dialogId in taro.game.data.dialogues) {
				var dialog = taro.game.data.dialogues[dialogId];

				if (dialogId === data.dialogue) {
					for (var optionId in dialog.options) {
						var option = dialog.options[optionId];

						if (optionId === data.option) {
							selectedOption = option;
							break;
						}
					}
				}
			}

			if (selectedOption) {
				taro.game.lastPlayerSelectingDialogueOption = player.id();
				if (selectedOption.scriptName) {
					taro.script.runScript(selectedOption.scriptName, {});
				}
				if (selectedOption.followUpDialogue) {
					taro.network.send('openDialogue', {
						dialogueId: selectedOption.followUpDialogue,
						extraData: {
							playerName: player._stats.name,
							dialogueTemplate: _.get(taro, 'game.data.ui.dialogueview.htmlData', '')
						}
					}, player._stats.clientId);
				}
			}
		}
	},

	_onPlayerKeyDown: function (data, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);
		if (player != undefined) {
			player.control.keyDown(data.device, data.key);
		}
	},

	_onPlayerKeyUp: function (data, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);
		if (player != undefined) {
			player.control.keyUp(data.device, data.key);
		}
	},

	_onPlayerSelectUnit: function (data, clientId) {
		var unit = taro.$(data.unitId);
		var player = taro.game.getPlayerByClientId(clientId);
		if (player && unit) {
			player.selectUnit(data.unitId);
		}
	},

	_onRecordSocketMsgs: function (data, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);

		if (!player?._stats.isUserAdmin) {
			return;
		}

		if (taro.clusterClient) {
			taro.clusterClient.recordLogs(data);
		}
	},

	_onGetSocketMsgs: function (data, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);

		if (!player?._stats.isUserAdmin) {
			return;
		}

		data = {...data, requester: clientId };

		if (taro.clusterClient) {
			taro.clusterClient.sendLogs(data);
		}
	},

	_onStopRecordSocketMsgs: function (data, clientId) {
		var player = taro.game.getPlayerByClientId(clientId);

		if (!player?._stats.isUserAdmin) {
			return;
		}

		if (taro.clusterClient) {
			taro.clusterClient.stopRecordLogs(data);
		}
	},

	_onPlayAdCallback: function (data, clientId) {
		taro.ad.playCallback(data, clientId);
	},

	_onSomeBullshit: function () {
		//bullshit
	}
};

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }
