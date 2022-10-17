var GameComponent = IgeEntity.extend({
	classId: 'GameComponent',
	componentId: 'game',

	init: function () {
		var self = this;

		this.units = {};
		this.players = {};
		this.items = {};
		this.food = {};
		this.joints = {};
		this.highlights = {};
		this.createdEntities = [];
		this.gameOverModalIsShowing = false;
		this.isGameStarted = false;
		this.devLogs = {};

	},

	start: function () {
		var self = this;
		GameComponent.prototype.log('Game component started');
		if (ige.isServer) {
			ige.chat.createRoom('lobby', {}, '1');

			// by default, create 5 computer players
			var aiCount = 10;
			// if (global.isDev) {
			// 	var aiCount = 50 // create 50 ai players if dev env
			// }

			for (var i = 1; i <= aiCount; i++) {
				this[`computer${i}`] = this.createPlayer({
					name: `AI ${i}`,
					controlledBy: 'computer',
					unitIds: [] // all units owned by player
				});
			}
		} else if (ige.isClient) {
			// determine which attribute will be used for scoreboard
			var attr = 'points';
			if (
				ige.game.data.settings &&
				ige.game.data.settings.constants &&
				ige.game.data.settings.constants.currency != undefined
			) {
				attr = ige.game.data.settings.constants.currency;
			}
			$('.game-currency').html(attr);
		}

		ige.addComponent(ScriptComponent);
		ige.script.load(ige.game.data.scripts);

		ige.script.trigger('gameStart');
		self.isGameStarted = true;
		ige.timer.startGameClock();
	},

	// this applies to logged in players only
	createPlayer: function (data, persistedData) {
		/* removing unnecessary purchases keys */
		var purchases = [];
		if (data.purchasables) {
			for (var i = 0; i < data.purchasables.length; i++) {
				var purchasable = data.purchasables[i];
				purchasable = _.pick(purchasable, ['_id', 'image', 'owner', 'target']);
				purchases.push(purchasable);
			}
		}

		var playerData = {
			controlledBy: data.controlledBy,
			name: data.name,
			coins: data.coins,
			points: data.points || 0,
			clientId: data.clientId,
			purchasables: purchases, // purchasables are currently equipped purchasables of the player for current game
			allPurchasables: data.allPurchasables, // allPurchasables includes equipped and purchased items of the player for current game			
			attributes: data.attributes,
			highscore: data.highscore,
			lastPlayed: data.lastPlayed,
			userId: data._id,
			isAdBlockEnabled: data.isAdBlockEnabled,
			unitIds: [], // all units owned by player,
			jointsOn: Date.now(), // use for calculating session,
			totalTime: data.totalTime,
			ipAddress: data.ipAddress,
			email: data.email,
			banChat: data.banChat,
			mutedUsers: data.mutedUsers,
			// isEmailVerified: true,
			// isUserVerified: true,
			isEmailVerified: data.isEmailVerified,
			isUserVerified: data.isUserVerified
		};

		var player = new Player(playerData);

		if (ige.isServer) {
			var logInfo = {
				name: playerData.name,
				clientId: playerData.clientId
			};

			if (playerData.userId) {
				logInfo.userId = playerData.userId;
			}

			// console.log(playerData.clientId + ': creating player for ', logInfo)
		}

		if (persistedData) {
			player.persistedData = persistedData;
		}

		if (ige.isServer) {
			ige.gameText.sendLatestText(data.clientId); // send latest ui information to the client
			// ige.shopkeeper.updateShopInventory(ige.shopkeeper.inventory, data.clientId) // send latest ui information to the client

			var isOwner = ige.server.owner == data._id && data.controlledBy == 'human';
			var isInvitedUser = false;
			if (ige.game.data.defaultData && ige.game.data.defaultData.invitedUsers) {
				isInvitedUser = ige.game.data.defaultData.invitedUsers.some(e => e._id === data._id);
			}
			var isUserAdmin = false;
			var isUserMod = false;
			if (data.permissions) {
				isUserAdmin = data.permissions.includes('admin');
				isUserMod = data.permissions.includes('mod');
			}
			player._stats.isUserAdmin = isUserAdmin;
			player._stats.isUserMod = isUserMod;
			
			// if User/Admin has access to game then show developer logs
			if (isOwner || isInvitedUser || isUserAdmin) {
				GameComponent.prototype.log(`owner/admin/mod connected. _id: ${data._id}`);
				ige.server.developerClientIds.push(data.clientId);
			}
		}

		return player;
	},

	// get client with ip
	getPlayerByIp: function (ip, currentUserId, all = false) {
		var clientIds = [];
		for (let clientId in ige.server.clients) {
			const clientObj = ige.server.clients[clientId];

			if (clientObj.ip === ip) {
				clientIds.push(clientId);
				if (!all) {
					break;
				}
			}
		}

		if (clientIds.length > 0) {
			var method = all ? 'filter' : 'find';
			return ige.$$('player')[method](player => {
				// var clientId = player && player._stats && player._stats.clientId;
				// added currentUserId check to confirm it is logged in user and not add-instance bot.
				return (
					player._stats &&
          clientIds.includes(player._stats.clientId) &&
          (all || (currentUserId && player._stats.userId != currentUserId))
				);
			});
		}
	},

	getPlayerByUserId: function (userId) {
		return ige.$$('player').find(function (player) {
			return player._stats && player._stats.userId == userId;
		});
	},

	getPlayerByClientId: function (clientId) {
		return ige.$$('player').find(function (player) {
			return player._stats && player._stats.controlledBy != 'computer' && player._stats.clientId == clientId;
		});
	},

	getAsset: function (assetType, assetId) {
		try {
			var asset = this.data[assetType][assetId];
			return JSON.parse(JSON.stringify(asset));
		} catch (e) {
			GameComponent.prototype.log(
				`getAsset ${assetType} ${assetId} ${e}`
			);
		}
	},
	secondsToHms: function (seconds) {
		seconds = Number(seconds);
		var h = Math.floor(seconds / 3600);
		var m = Math.floor((seconds % 3600) / 60);
		var s = Math.floor((seconds % 3600) % 60);

		var hDisplay = h > 0 ? `${h}h ` : '';
		var mDisplay = m > 0 ? `${m}m ` : '';
		var sDisplay = s > 0 ? `${s}s` : '';
		return hDisplay + mDisplay + sDisplay;
	},

	// update dev console table w/ latest setValue data
	updateDevConsole: function (data) {
		var self = this;
		// if a developer is connected, send devLog of global variables only
		if (ige.isServer && (ige.server.developerClientIds.length || process.env.ENV === 'standalone' || process.env.ENV == 'standalone-remote')) {
			// only show 'object' string if env variable is object
			if (typeof data.params.newValue == 'object') {
				if (data.params.newValue._stats) {
					ige.game.devLogs[data.params.variableName] = `object (${data.params.newValue._category}): ${data.params.newValue._stats.name}`;
				} else {
					ige.game.devLogs[data.params.variableName] = 'object';
				}
			} else { // otherwise, show the actual value

				ige.game.devLogs[data.params.variableName] = data.params.newValue;
			}
		} else if (ige.isClient) {
			// update GS CPU graphs if data present
			if (data.status && data.status.cpu) {
				// cpu time spent in user code (ms) since last dev console update - may end up being greater than actual elapsed time if multiple CPU cores are performing work for this process
				if (data.status.cpu.user) {
					statsPanels.serverCpuUser._serverCpuUserPanel.update(data.status.cpu.user * 0.001, 1000);
				}
				// cpu time spent in system code (ms) since last dev console update
				if (data.status.cpu.system) {
					statsPanels.serverCpuSystem._serverCpuSystemPanel.update(data.status.cpu.system * 0.001, 1000);
				}
			}

			var totalAttrsCount = 0;
			for (variableName in data) {
				if (variableName !== 'status') {
					var div = $(`#variables-div div.col-sm-12[name='${variableName}']`);
					var newValue = data[variableName];
					if (div.length) {
						div.find('.setVariable-value').html(newValue);
					} else {
						$('#variables-div').append(
							$('<div/>', {
								name: variableName,
								class: 'col-sm-12',
								style: 'font-size: 12px'
							}).append(
								$('<td/>', {
									html: variableName,
									style: 'color:yellow; padding-left: 10px'
								})
							).append(
								$('<td/>', {
									class: 'setVariable-value text-left',
									html: newValue,
									style: 'padding: 0px 10px 0px 10px'
								})
							)
						);
					}

					totalAttrsCount++;
				}
			}

			if (data.status != {} /*&& ige.physics && ige.physics.engine != 'CRASH'*/) {
				// if streaming entity count > 150 warn user
				if (data.status && data.status.entityCount && data.status.entityCount.streaming > 150 && !self.streamingWarningShown) {
					$('#streaming-entity-warning').show();
					self.streamingWarningShown = true;
				}

				var innerHtml = '';

				innerHtml = `${'' +
					'<table class="table table-hover text-center" style="border:1px solid #eceeef">' +
					'<tr>' +
					'<th>Entity Count</th>' +
					'<th class="text-center">Server</th>' +
					'<th class="text-center">Client</th>' +
					'<th class="text-center">Server Bandwidth</th>' +
					'</tr>' +
					'<tr>' +
					'<td>Unit</td>' +
					'<td>'}${data.status.entityCount.unit}</td>` +
					`<td>${ige.$$('unit').length}</td>` +
					`<td>${data.status.bandwidth.unit}</td>` +
					'</tr>' +
					'<tr>' +
					'<td>Item</td>' +
					`<td>${data.status.entityCount.item}</td>` +
					`<td>${ige.$$('item').length}</td>` +
					`<td>${data.status.bandwidth.item}</td>` +
					'</tr>' +
					'<tr>' +
					'<td>Player</td>' +
					`<td>${data.status.entityCount.player}</td>` +
					`<td>${ige.$$('player').length}</td>` +
					`<td>${data.status.bandwidth.player}</td>` +
					'</tr>' +
					'<tr>' +
					'<td>Projectile</td>' +
					`<td>${data.status.entityCount.projectile}</td>` +
					`<td>${ige.$$('projectile').length}</td>` +
					`<td>${data.status.bandwidth.projectile}</td>` +
					'</tr>' +
					'<tr>' +
					'<td>Region</td>' +
					`<td>${data.status.entityCount.region}</td>` +
					`<td>${ige.$$('region').length}</td>` +
					`<td>${data.status.bandwidth.region}</td>` +
					'</tr>' +
					'<tr>' +
					'<td>Sensor</td>' +
					`<td>${data.status.entityCount.sensor}</td>` +
					`<td>${ige.$$('sensor').length}</td>` +
					`<td>${data.status.bandwidth.sensor}</td>` +
					'</tr>' +
					'<tr>' +
					'<th colspan= >Physics</th>' +
					`<th>${data.status.physics.engine}</th>` +
					`<th>${(ige.physics) ? ige.physics.engine : 'NONE'}</th>` +
					'<td></td>' +
					'</tr>' +
					'<tr>' +
					'<td>Bodies</td>' +
					`<td>${data.status.physics.bodyCount}</td>` +
					`<td>${(ige.physics && ige.physics._world) ? ige.physics._world.m_bodyCount : ''}</td>` +
					'<td></td>' +
					'</tr>' +
					'<tr>' +
					'<td>Joints</td>' +
					`<td>${data.status.physics.jointCount}</td>` +
					`<td>${(ige.physics && ige.physics._world) ? ige.physics._world.m_jointCount : ''}</td>` +
					'<td></td>' +
					'</tr>' +
					'<tr>' +
					'<td>Contacts</td>' +
					`<td>${data.status.physics.contactCount}</td>` +
					`<td>${(ige.physics && ige.physics._world) ? ige.physics._world.m_contactCount : ''}</td>` +
					'<td></td>' +
					'</tr>' +
					'<tr>' +
					'<td>Heap used</td>' +
					`<td>${data.status.heapUsed.toFixed(2)}</td>` +
					`<td>${(window.performance.memory.usedJSHeapSize / 1000000).toFixed(2)}</td>` +
					'<td></td>' +
					'</tr>' +
					'<tr>' +
					'<td>Avg Step Duration(ms)</td>' +
					`<td>${data.status.physics.stepDuration}</td>` +
					`<td>${(ige.physics && ige.physics._world) ? ige.physics.avgPhysicsTickDuration.toFixed(2) : ''}</td>` +
					'<td></td>' +
					'</tr>' +
					'<tr>' +
					'<td>Physics FPS</td>' +
					`<td>${data.status.physics.stepsPerSecond}</td>` +
					`<td>${(ige.physics) ? ige._physicsFPS : ''}</td>` +
					'<td></td>' +
					'</tr>' +
					'<tr>' +
					'<th colspan=3>Etc</th><th>Time Scale</th>' +
					'</tr>' +
					'<tr>' +
					'<td>Current Time</td>' +
					// + '<td>' + data.status.currentTime + '(' + (data.status.currentTime - this.prevServerTime) + ')' + '</td>'
					// + '<td>' + Math.floor(ige._currentTime) + '(' + (Math.floor(ige._currentTime) - this.prevClientTime) + ')' + '</td>'
					`<td>${data.status.currentTime}</td>` +
					`<td>${Math.floor(ige._currentTime)}(${Math.floor(ige._currentTime) - data.status.currentTime})</td>` +
					`<td>${ige.timeScale()}</td>` +
					'</tr>' +

					'<tr>' +
					'<td>Client Count</td>' +
					`<td>${data.status.clientCount}</td>` +
					'<td></td>' +
					'<td></td>' +
					'</tr>' +

					'<tr>' +
					'<td>entityUpdateQueue size</td>' +
					'<td></td>' +
					`<td>${Object.keys(ige.client.entityUpdateQueue).length}</td>` +
					'<td></td>' +
					'</tr>' +
					'<tr>' +
					'<td>Total players created</td>' +
					`<td>${data.status.etc.totalPlayersCreated}</td>` +
					'<td></td>' +
					'<td></td>' +
					'</tr>' +

					'<tr>' +
					'<td>Total units created</td>' +
					`<td>${data.status.etc.totalUnitsCreated}</td>` +
					'<td></td>' +
					'<td></td>' +
					'</tr>' +

					'<tr>' +
					'<td>Total items created</td>' +
					`<td>${data.status.etc.totalItemsCreated}</td>` +
					'<td></td>' +
					'<td></td>' +
					'</tr>' +

					'<tr>' +
					'<td>Total Bodies Created</td>' +
					`<td>${data.status.physics.totalBodiesCreated}</td>` +
					`<td>${(ige.physics && ige.physics._world) ? ige.physics.totalBodiesCreated : ''}</td>` +
					'<td></td>' +
					'</tr>' +

					'<tr>' +
					'<td>CPU Usage</td>' +
					`<td>${data.status.cpuDelta}</td>` +
					'<td></td>' +
					'<td></td>' +
					'</tr>' +

					'<tr>' +
					'<td>Last Snapshot Length</td>' +
					`<td>${data.status.lastSnapshotLength}</td>` +
					'<td></td>' +
					'<td></td>' +
					'</tr>' +

					'</table>';

				ige.script.variable.prevServerTime = data.status.currentTime;
				ige.script.variable.prevClientTime = Math.floor(ige._currentTime);

				$('#dev-status-content').html(innerHtml);
				self.secondCount++;
			}
		}
	}
});

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = GameComponent;
}
