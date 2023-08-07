var ScoreboardComponent = TaroEntity.extend({
	classId: 'ScoreboardComponent',
	componentId: 'scoreboard',

	init: function () {
		var self = this;
		// self.scoreAttributeId = taro.game.data.settings.scoreBoard
		// console.log("taro.game.data.settings", taro.game.data.settings)
		self.scoreAttributeId = taro.game.data.settings.scoreAttributeId;
		self._hidden = false;

		self.scoreboardElement = null;
		self.leaderboardToggleElement = null;

		self.setUI();
	},

	setUI: function () {
		if (taro.isMobile) {
			$('#scoreboard-header').addClass('small');
			$('#scoreboard').addClass('small');
		} else {
			$('#scoreboard-header').addClass('h5');
			$('#scoreboard').addClass('h6');
			$('#leaderboard')
				.addClass('h3')
				.removeClass('d-none');
		}

		// due to rendering order, on standalone, leaderboard is rendered behind
		// the game div content. setting z-index 1 is enough to pull it forward
		if (window.isStandalone) {
			$('#leaderboard').css('z-index', 1);
		}

		// $(function () {
		// 	$.contextMenu({
		// 		selector: '.scoreboard-user-entry',
		// 		build: function ($trigger) {
		// 			var userData = $trigger.data();
		// 			var myPlayer = taro.client.myPlayer;

		// 			if (!myPlayer || !myPlayer._stats) {
		// 				return;
		// 			}

		// 			var userId = myPlayer._stats.userId;
		// 			var mutedUsers = myPlayer._stats.mutedUsers;
		// 			if (userId === userData.userId) {
		// 				// user cannot perform action on his/her own player
		// 				return;
		// 			}

		// 			taro.scoreboard.selectedUser = userData;

		// 			var index = mutedUsers.indexOf(taro.scoreboard.selectedUser.userId);

		// 			return {
		// 				callback: function (key) {
		// 					switch (key) {
		// 						case 'unmute': {
		// 							mutedUsers.splice(index, 1);
		// 							$.ajax({
		// 								url: `/api/user/toggle-mute/${taro.scoreboard.selectedUser.userId}`,
		// 								type: 'POST',
		// 								success: function (data) {
		// 									console.log(data);											// alert('request sent');
		// 								}
		// 							});
		// 							break;
		// 						}
		// 						case 'mute': {
		// 							mutedUsers.push(taro.scoreboard.selectedUser.userId);
		// 							$.ajax({
		// 								url: `/api/user/toggle-mute/${taro.scoreboard.selectedUser.userId}`,
		// 								type: 'POST',
		// 								success: function (data) {
		// 									console.log(data);											// alert('request sent');
		// 								}
		// 							});
		// 							break;
		// 						}
		// 						case 'addFriend': {
		// 							$.ajax({
		// 								url: `/api/user/request/${taro.scoreboard.selectedUser.userId}`,
		// 								type: 'POST',
		// 								success: function (data) {
		// 									alert('request sent');
		// 								}
		// 							});
		// 							break;
		// 						}
		// 					}
		// 				},
		// 				items: {
		// 					addFriend: {
		// 						name: 'Add Friend'
		// 					},
		// 					separator: { type: 'cm_separator' },
		// 					unmute: {
		// 						name: `Unmute ${taro.scoreboard.selectedUser.userName}`,
		// 						visible: index > -1
		// 					},
		// 					mute: {
		// 						name: `Mute ${taro.scoreboard.selectedUser.userName}`,
		// 						visible: index === -1,
		// 						className: 'context-menu-item context-menu-hover context-menu-danger'
		// 					}
		// 				}
		// 			};
		// 		}
		// 	});
		// });
	},

	convertNumbersToKMB: function (labelValue) {
		if (taro.game.data.settings.prettifyingScoreboard) {
			// Nine Zeroes for Billions
			return Math.abs(Number(labelValue)) >= 1.0e+9

				? `${(Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2)}B`
				// Six Zeroes for Millions
				: Math.abs(Number(labelValue)) >= 1.0e+6

					? `${(Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2)}M`
					// Three Zeroes for Thousands
					: Math.abs(Number(labelValue)) >= 1.0e+3

						? `${(Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2)}K`

						: Math.abs(Number(labelValue));
		} else {
			return labelValue;
		}
	},
	update: function () {
		var self = this;
		var DEFAULT_COLOR = 'white';

		if (taro.isClient) {
			var scoreboard = '';
			var sortedScores = [];
			var players = taro.$$('player');
			var topPlayersToShow = taro.isMobile ? 3 : 10;

			players.forEach(function (player) {
				if (player._stats && (
					// only display human players on scoreboard
					player._stats.controlledBy == 'human'
				)
				) {
					var playerId = player.id();
					var score = 0;
					if (self.scoreAttributeId && player._stats.attributes && player._stats.attributes[self.scoreAttributeId]) {
						var playerAttribute = player._stats.attributes[self.scoreAttributeId];
						score = playerAttribute.value;
						var decimalPlace = parseInt(playerAttribute.decimalPlaces) || 0;
						var score = parseFloat(playerAttribute.value).toFixed(decimalPlace);
					}

					sortedScores.push({
						key: playerId,
						value: score
					});
				}
			});

			sortedScores.sort(function (a, b) {
				return a.value - b.value;
			});

			for (var i = sortedScores.length - 1; i >= 0; i--) {
				var playerId = sortedScores[i].key;
				var player = taro.$(playerId);
				var defaultFontWeight = 500;
				if (player) {
					var color = null; // color to indicate human, animal, or my player on scoreboard
					let playerIsSelf = '';

					var playerType = taro.game.getAsset('playerTypes', player._stats.playerTypeId);

					if (playerType && playerType.color) {
						color = playerType.color;
					}

					// highlight myself (player) on leaderboard
					if (player._stats.controlledBy == 'human' && player._stats.clientId == taro.network.id()) {
						defaultFontWeight = 800;
						color = '#99FF00';
						playerIsSelf = 'scoreboard-player-is-myself';
					}

					var readableName = player._stats.name || '';

					readableName = readableName.replace(/</g, '&lt;');
					readableName = readableName.replace(/>/g, '&gt;');

					color = color || DEFAULT_COLOR;
					scoreboard += `
						<div onContextMenu="window.showUserDropdown({ event, userId: '${player._stats.userId}' })" class='cursor-pointer scoreboard-user-entry scoreboard-player-rank-${i} ${playerIsSelf}' style='color: ${color};font-weight:${defaultFontWeight}'>
							<span class='scoreboard-player-name'>${readableName}</span> <small class='scoreboard-player-score'><span>${self.convertNumbersToKMB(sortedScores[i].value)}</span></small>
						</div>
					`;
				}
			}

			taro.client.clientCount = sortedScores.length;

			// $('#player-count').html(players.length);
			// const playerCount = document.getElementById('player-count');

			// if (playerCount) {
			// 	playerCount.innerHTML = players.length;
			// }

			if (!self.scoreboardElement) {
				self.scoreboardElement = document.getElementById('scoreboard');
			}

			if (!self.leaderboardToggleElement) {
				self.leaderboardToggleElement = document.getElementById('leaderboard-toggle');
			}

			if (self._hidden) {
				if (self.scoreboardElement) {
					self.scoreboardElement.innerHTML = '';
				}
				if (self.leaderboardToggleElement) {
					self.leaderboardToggleElement.innerHTML = '&nbsp;<i class="far fa-caret-square-down" aria-hidden="true" onclick="taro.scoreboard.toggleScores()" style="cursor:pointer;"></i>';
				}
			} else {
				if (self.scoreboardElement) {
					self.scoreboardElement.innerHTML = scoreboard;
				} 
				if (self.leaderboardToggleElement) {
					self.leaderboardToggleElement.innerHTML = '&nbsp;<i class="far fa-caret-square-up" aria-hidden="true" onclick="taro.scoreboard.toggleScores()" style="cursor:pointer;"></i>';
				}
			}
		}
	},

	hideScores: function () {
		this._hidden = true;
	},

	showScores: function () {
		this._hidden = false;
	},

	toggleScores: function () {
		this._hidden = !this._hidden;
	}

});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = ScoreboardComponent;
}
