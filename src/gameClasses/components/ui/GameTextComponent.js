var GameTextComponent = TaroEntity.extend({
	classId: 'GameTextComponent',
	componentId: 'gameText',

	init: function () {
		var self = this;

		if (taro.isServer) {
			self.latestText = {}; // stores last sent text, so newly joined users can see it
		}
	},

	updateText: function (data, clientId) {
		if (taro.isServer) {
			this.latestText[data.target] = data.value;
			data.value = taro.sanitizer(data.value);
			taro.network.send('updateUiText', data, clientId); // update text for all clients
		} else {
			data.value = taro.clientSanitizer(data.value);
			this.updateUiText(data);
		}
	},

	updateTextForTime: function (data, clientId) {
		if (taro.isServer) {
			this.latestText[data.target] = data.value;
			data.value = taro.sanitizer(data.value);
			taro.network.send('updateUiTextForTime', data, clientId); // update text for all clients
		} else {
			data.value = taro.clientSanitizer(data.value);
			this.updateUiTextForTime(data);
		}
	},

	sendLatestText: function (clientId) {
		if (taro.isServer) {
			for (i in this.latestText) {
				var data = {
					target: i,
					value: this.latestText[i],
				};
				// taro.log("sendLatestText: " + JSON.stringify(data) + " to "+clientId)
				data.value = taro.sanitizer(data.value);
				taro.network.send('updateUiText', data, clientId);
			}
		}
	},

	alertHighscore: function (clientId) {
		if (taro.isServer) {
			taro.network.send('alertHighscore', {}, clientId);
		}
	},

	updateUiText: function (data) {
		const runAction = functionalTryCatch(() => {
			if (!data.target) {
				return;
			}
			const key = `ui-text-${data.target}-id`;

			if (!taro.uiTextElementsObj[key]) {
				taro.uiTextElementsObj[key] = document.getElementById(key);
			}
			if (!taro.uiTextElementsObj[key]) {
				return;
			}

			if (data.action == 'show') {
				// $(`.ui-text-${data.target}`).show();
				taro.uiTextElementsObj[key].style.display = 'block';
			} else if (data.action == 'hide') {
				taro.uiTextElementsObj[key].style.display = 'none';
			} else {
				taro.uiTextElementsObj[key].innerHTML = data.value;
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	updateUiTextForTime: function (data) {
		$(`.ui-text-${data.target}`).show();
		$(`.ui-text-${data.target}`).html(taro.clientSanitizer(data.value));

		if (!this.textTimerData) {
			this.textTimerData = {};
		}

		// stop the timeout and remove old textTimerData
		if (this.textTimerData[data.target]?.textTimer) {
			clearTimeout(this.textTimerData[data.target].textTimer);
			delete this.textTimerData[data.target];
		}

		if (data.time && data.time > 0) {
			this.textTimerData[data.target] = {
				target: data.target,
				textTimer: setTimeout(() => {
					$(`.ui-text-${this.textTimerData[data.target].target}`).hide();
					delete this.textTimerData[data.target];
				}, data.time),
			};
		}
	},

	// showKillStreakMessage: function(playerName, killStreakCount) {

	// 	var message = "";
	// 	var fontSize = 30;
	// 	$('#kill-streak-message').show();
	// 	switch(killStreakCount)
	// 	{
	// 		case 2:
	// 			message = playerName + "'s got a DOUBLE KILL";
	// 			fontSize = 30;
	// 			break;

	// 		case 3:
	// 			message = playerName + "'s got a TRIPLE KILL";
	// 			fontSize = 35;
	// 			break;

	// 		case 4:
	// 			message = playerName + " is a PLAGUE";
	// 			fontSize = 40;
	// 			break;

	// 		case 5:

	// 		default:
	// 			message = playerName + " is the RAPTURE!!!";
	// 			fontSize = 60;
	// 			break;
	// 	}
	// 	$("#kill-streak-message").css({ fontSize: fontSize }).text(message).delay(5000).fadeOut("slow");;
	// },
});

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = GameTextComponent;
}
