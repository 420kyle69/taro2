/**
 * The client-side chat component. Handles all client-side
 * chat methods and events.
 */
var openChatBubble = {};
var IgeChatClient = {
	/**
	 * Asks the serve to let us join the room specified.
	 * @param {String} roomId The room id of the room to join.
	 */
	joinRoom: function (roomId) {
		ige.network.send('igeChatJoinRoom', roomId);
	},

	sendToRoom: function (roomId, message, to) {
		if (roomId !== undefined && message !== undefined) {
			msg = {
				roomId: roomId,
				text: message,
				to: to
			};

			ige.network.send('igeChatMsg', msg);
		}
	},

	_onMessageFromServer: function (data) {
		var self = ige.chat;

		
		// message from a player
		if (data && data.from) { 
			var player = ige.game.getPlayerByClientId(data.from);

			var isPlayerMuted = ige.client.myPlayer &&
				ige.client.myPlayer._stats &&
				ige.client.myPlayer._stats.mutedUsers &&
				ige.client.myPlayer._stats.mutedUsers.indexOf(player._stats.userId) > -1;
			
			// ignore messages from players I muted
			if (player && isPlayerMuted) {
				return;
			}
		}

		var isChatHidden = $('#chat-box').hasClass('d-none');
				
		// display message if it's either system message, or if chat is visible
		if (player == undefined || !isChatHidden) {

			ige.chat.postMessage(data);
			
			if (player) {
				var selectedUnit = player.getSelectedUnit();

				if (selectedUnit && selectedUnit.gluedEntities) {
					// destroy existing chat bubble if it exists
					for (var i = 0; i < selectedUnit.gluedEntities.length; i++) {
						var gluedEntity = selectedUnit.gluedEntities[i];
						if (gluedEntity.type === 'chatBubble') {
							var igeEntity = ige.$(gluedEntity.id);

							if (igeEntity) {
								igeEntity.destroy();
							}
						}
					}

					if (openChatBubble[selectedUnit.id()] && selectedUnit._category === 'unit') {
						openChatBubble[selectedUnit.id()].destroy();
						delete openChatBubble[selectedUnit.id()];
					}
					openChatBubble[selectedUnit.id()] = new IgePixiChatBubble(data.text, {
						parentUnit: selectedUnit.id()
					})
						.fade(3000);
				}	
			}
						
		}
		
	},

	_onJoinedRoom: function (data) {
		var self = ige.chat;

		// Emit the event and if it wasn't cancelled (by returning true) then
		// process this ourselves
		if (!self.emit('joinedRoom', [data])) {
			if (data.joined === true) {
				// console.log('Server says we have joined room:', data.roomId);
			} else {
				// console.log('Server says we failed to join room:', data.roomId);
			}
		}
	},

	_onLeftRoom: function (data) {
		var self = ige.chat;

		// Emit the event and if it wasn't cancelled (by returning true) then
		// process this ourselves
		if (!self.emit('leftRoom', [data])) {
			console.log('We have left room:', data);
		}
	},

	_onServerSentRoomList: function (data) {
		var self = ige.chat;

		// Emit the event and if it wasn't cancelled (by returning true) then
		// process this ourselves
		if (!self.emit('roomList', [data])) {
			console.log('Server sent room list:', data);
		}
	},

	_onServerSentRoomUserList: function (data) {
		var self = ige.chat;

		// Emit the event and if it wasn't cancelled (by returning true) then
		// process this ourselves
		if (!self.emit('roomUserList', [data])) {
			console.log('Server sent room user list:', data);
		}
	},

	_onRoomCreated: function (data) {
		var self = ige.chat;

		// Emit the event and if it wasn't cancelled (by returning true) then
		// process this ourselves
		if (!self.emit('roomCreated', [data])) {
			console.log('Server told us room was created:', data);
		}
	},

	_onRoomRemoved: function (data) {
		var self = ige.chat;

		// Emit the event and if it wasn't cancelled (by returning true) then
		// process this ourselves
		if (!self.emit('roomRemoved', [data])) {
			console.log('Server told us room was removed:', data);
		}
	}
};

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = IgeChatClient; }
