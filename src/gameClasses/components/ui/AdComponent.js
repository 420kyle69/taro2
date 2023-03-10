var AdComponent = TaroEntity.extend({
	classId: 'AdComponent',
	componentId: 'ad',

	init: function () {
		if (taro.isClient && window.adsAllowed) {
			$('body').append($('<div/>', {
				id: 'preroll',
				style: 'z-index:40000; display: none',
				class: 'absolute-center'
			}));
			this.initAdPlayer();
		}
		this.lastPlayedAd = null;
		this.token = null;
	},
	
	initAdPlayer: function () {
		var self = this;
		if (taro.isClient) {
			window.aiptag.cmd.player.push(function() {
				window.aiptag.adplayer = new aipPlayer({
					AD_WIDTH: 960,
					AD_HEIGHT: 540,
					AD_FULLSCREEN: false,
					AD_CENTERPLAYER: false,
					LOADING_TEXT: 'loading advertisement',
					PREROLL_ELEM: function () {
						return document.getElementById('preroll')
					},
					AIP_COMPLETE: function (type) {
						self.prerollEventHandler(type);
					},
					AIP_REMOVE: function () {
						// hide ad container, no actions needed
					},
				});
			});
		}
	},
	
	playAd: function (data, clientId) {
		const jwt = require("jsonwebtoken");
		data.token = jwt.sign({
				clientId,
				type: 'creditAdRewardToken',
				createdAt: Date.now()
			},
			process.env.JWT_SECRET_KEY, {
				expiresIn: taro.server.AD_REWARD_JWT_EXPIRES_IN.toString(),
			});
		
		taro.network.send('playAd', data, clientId);
	},
	
	play: function (data, clientId) {
		var self = this;
		if (taro.isServer) {
			
			if (clientId) {
				// play ad for specific client
				this.playAd(data, clientId);
			} else {
				// play ad for all clients
				for (const cId in taro.server.clients) {
					this.playAd(data, cId);
				}
			}
		} else if (taro.isClient) {
			
			this.token = data.token;
			
			// are we running on mobile
			// if (taro.isMobile) {
			// 	// on mobile
			// 	var eventData = { msg: 'showad' };
			//
			// 	if (window.msgQueue) {
			// 		// running inside modd cordova wrapper
			// 		window.msgQueue.push(eventData);
			// 	} else {
			// 		// on mobile web AIP ads not working well
			// 		console.log('adplay req mobile web');
			// 	}
			//
			// 	sendMessageToReactNative(eventData);
			// } else {
				// on desktop
				if (typeof isInIFrame !== 'undefined' && isInIFrame) {
					self.prerollEventHandler('video-ad-skip-in-iframe');
					return;
				}
				
				//check if the adslib is loaded correctly or blocked by adblockers etc.
				if (typeof window.aiptag.adplayer !== 'undefined') {
					// showing ad
					window.aiptag.cmd.player.push(function() {
						window.aiptag.adplayer.startPreRoll();
					});
				} else {
					//Adlib didn't load this could be due to an adblocker, timeout etc.
					//Please add your script here that starts the content, this usually is the same script as added in AIP_COMPLETE.
					self.prerollEventHandler('video-ad-blocked');
				}
			// }
		}
	},
	
	playCallback: function (data, clientId) {
		// Ad reward goes to game owner
		taro.server.creditAdRewardToOwner(data, clientId);
		
		if (taro.script) { // do not send trigger for neutral player
			var player = taro.game.getPlayerByClientId(clientId)
			
			if (data.status === 'completed') {
				taro.script.trigger('adPlayCompleted', { playerId: player.id() });
			} else if (data.status === 'skipped') {
				taro.script.trigger('adPlaySkipped', { playerId: player.id() });
			} else if (data.status === 'blocked') {
				taro.script.trigger('adPlayBlocked', { playerId: player.id() });
			} else if (data.status === 'failed') {
				taro.script.trigger('adPlayFailed', { playerId: player.id() });
			}
		}
		
		var socket = taro.network._socketById[clientId];
		
		if (socket && socket._token && socket._token.distinctId) {
			/** additional part to send some info for marketing purposes */
			global.mixpanel.track('Game Session Duration', {
				'distinct_id': socket._token.distinctId,
				'$ip': socket._remoteAddress,
				'gameSlug': taro.game && taro.game.data && taro.game.data.defaultData && taro.game.data.defaultData.gameSlug,
				'gameId': taro.game && taro.game.data && taro.game.data.defaultData && taro.game.data.defaultData._id,
				'gameCreator': taro.game && taro.game.data && taro.game.data.defaultData && taro.game.data.defaultData.owner,
				'status': data.status,
				'type': data.type,
			});
		}
	},
	
	prerollEventHandler: function (type) {
		const token = this.token;
		switch (type) {
			case 'video-ad-completed':
				// ad watch completed
				// credit coins to creator
				taro.network.send('playAdCallback', {status: 'completed', type, token});
				break;
			case 'video-ad-skipped':
				// ad watch started and skipped after a few seconds
				taro.network.send('playAdCallback', {status: 'skipped', type, token});
				break;
			case 'video-ad-blocked':
				// ad didn't load or errored
				taro.network.send('playAdCallback', {status: 'blocked', type, token});
				break;
			case 'video-ad-close':
			case 'video-ad-empty':
			case 'video-ad-error':
			case 'video-ad-timeout':
			case 'video-ad-removed':
			case 'video-ad-skip-in-iframe':
			case 'video-ad-action-limit-reached':
				// ad didn't load or errored
				taro.network.send('playAdCallback', {status: 'failed', type, token});
				break;
			case 'video-ad-clicked':
			case 'video-ad-loaded':
			case 'video-ad-paused':
			case 'video-ad-unpaused':
			case 'video-ad-resumed':
			case 'video-ad-started':
				// intermediate states, for now AIP doesn't trigger these states, maybe we need to add custom event listeners for AIP
				break;
		}
	},
	
	showRewardAd: function () {
		if (window.cpmStarRAd) {
			if (window.cpmStarRAd.isLoaded()) {
				window.cpmStarRAd.show();
			} else {
				window.cpmStarRAd.load();
			}
		} else {
			console.log('window.cpmStarRAd is not defined', window.cpmStarRAd);
		}
	},

	showAnchorTag: function () {
		if (noAds) {

		}
	}

});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = AdComponent;
}
