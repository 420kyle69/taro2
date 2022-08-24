/**
 * Adds stream capabilities to the network system.
 */
var IgeStreamComponent = IgeEventingClass.extend({
	classId: 'IgeStreamComponent',
	componentId: 'stream',

	/**
	 * @constructor
	 * @param entity
	 * @param options
	 */
	init: function (entity, options) {
		this._entity = entity;
		this._options = options;

		var self = this;

		// Set the stream data section designator character
		this._sectionDesignator = '¬';

		/* CEXCLUDE */
		if (ige.isServer) {
			// Define the network stream command
			this._entity.define('_igeStreamCreate');
			this._entity.define('_igeStreamCreateSnapshot');
			this._entity.define('_igeStreamDestroy');
			this._entity.define('_igeStreamData');
			this._entity.define('_igeStreamTime');

			// Define the object that will hold the stream data queue
			this._queuedData = {};

			// keep track of which clients have received which entities' stream
			this._streamClientCreated = {};
		}
		/* CEXCLUDE */

		if (ige.isClient) {
			// Define the network stream command
			this._entity.define('_igeStreamCreate', function () { self._onStreamCreate.apply(self, arguments); });
			this._entity.define('_igeStreamDestroy', function () { self._onStreamDestroy.apply(self, arguments); });
			this._entity.define('_igeStreamData', function () { self._onStreamData.apply(self, arguments); });
			this._entity.define('_igeStreamTime', function () { self._onStreamTime.apply(self, arguments); });
			this._entity.define('_igeStreamCreateSnapshot', function () { self._onStreamCreateSnapshot.apply(self, arguments); });
		}
	},
	
	/* CEXCLUDE */
	/**
	 * Starts the stream of world updates to connected clients.
	 */
	start: function () {
		IgeStreamComponent.prototype.log('Starting delta stream...');
		return this._entity;
	},

	/**
	 * update entity-attributes (unit, player, and projectiles)
	 */
	updateEntityAttributes: function () {
		var data = {};
		var entities = ige.$('baseScene')._children;

		var sendData = false;
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var queuedStreamData = entity.getQueuedStreamData();

			// commented out due to wasteful use of bandwidth
			// if (queuedStreamData.streamedOn) {
			// 	queuedStreamData.actualStreamedOn = Date.now();
			// }

			if (entity && Object.keys(queuedStreamData).length > 0) {
				data[entity.id()] = queuedStreamData;
				entity._streamDataQueued = [];
				sendData = true;
			}
		}

		if (sendData) {
			ige.network.send('updateAllEntities', data);
		}

		data = null;
		entity = null;
		entities = null;
	},

	/**
	 * Stops the stream of world updates to connected clients.
	 */
	stop: function () {
		// this._stopTimeSync(); // was this removed ???

		IgeStreamComponent.prototype.log('Stopping delta stream...');
		clearInterval(this._streamTimer);

		return this._entity;
	},

	/**
	 * Queues stream data to be sent during the next stream data interval.
	 * @param {String} id The id of the entity that this data belongs to.
	 * @param {String} data The data queued for delivery to the client.
	 * @param {String} clientId The client id this data is queued for.
	 * @return {*}
	 */
	queue: function (id, data) {
		// dont overwrite data if data.length is more than 10bytes
		// not this is temporary fix for case when entity teleports to some location
		// during that we have to make sure that client receives queued data for teleportation and
		// will have to stop that data getting overwritten due to some other section data
		// the reason is because teleportation data consists a byte the tells client to stop smooth animation
		// if that data gets overwritten by some other data that client will see a smooth transition from
		// entity's current location to final location
		this._entity.add('_igeStreamData', data);
		// if (!this._queuedData[id] || this._queuedData[id][0].length <= 20) {
		// }
		return this._entity;
	},
	createQueue: function (commandName, data, clientId) {
		// dont overwrite data if data.length is more than 10bytes
		// not this is temporary fix for case when entity teleports to some location
		// during that we have to make sure that client receives queued data for teleportation and
		// will have to stop that data getting overwritten due to some other section data
		// the reason is because teleportation data consists a byte the tells client to stop smooth animation
		// if that data gets overwritten by some other data that client will see a smooth transition from
		// entity's current location to final location
		this._entity.add(commandName, data, clientId);
		// if (!this._queuedData[id] || this._queuedData[id][0].length <= 20) {
		// }
		return this._entity;
	},

	/**
	 * Asks the server to send the data packets for all the queued stream
	 * data to the specified clients.
	 * @private
	 */
	_sendQueue: function (timeStamp) {
		// console.log(serverTime)
		// Send the stream data
		this._entity.flush(timeStamp);
		// }
	},
	/* CEXCLUDE */

	/**
	 * Handles receiving the start time of the stream data.
	 * @param data
	 * @private
	 */
	_onStreamTime: function (data) {
		this._streamDataTime = data;
	},
	_onStreamCreateSnapshot: function (data) {
		console.log(data);
	},
	_onStreamCreate: function (data) {
		var classId = data[0];
		var entityId = data[1];
		var parentId = data[2];
		var transformData = data[3];
		var createData = data[4];
		var parent = ige.$(parentId);
		var classConstructor;
		var ntransdata;
		var entity;

		// ige.devLog("onStreamCreate", entityId, classId, createData);
		if (transformData) {
			var ntransdata = [
				parseInt(transformData[0], 16),
				parseInt(transformData[1], 16),
				parseInt(transformData[2], 16) / 1000
			]; // x, y, rotation
		}

		// Check the required class exists
		if (parent) {
			// Check that the entity doesn't already exist
			if (!ige.$(entityId)) {
				classConstructor = igeClassStore[classId];

				if (classConstructor) {
					createData.defaultData = {
						translate: {
							x: ntransdata[0],
							y: ntransdata[1]
						},
						rotate: ntransdata[2]
					};

					entity = new classConstructor(createData, entityId);

					// don't send 'create' stream for spriteonly/weldjoint items
					var body = entity._stats.currentBody;
					if (entity._category != 'item' || (body && body.jointType != 'weldJoint')) {
						entity.bypassSmoothing = true;
						entity.streamSectionData('transform', ntransdata);
					}

					// Set the just created flag which will stop the renderer
					// from handling this entity until after the first stream
					// data has been received for it
					if (entity._streamEmitCreated) {
						entity.emit('streamCreated');
					}
					// entity.bypassSmoothing = false;
					// IgeStreamComponent.prototype.log(entity)
					// Since we just created an entity through receiving stream
					// data, inform any interested listeners
					this.emit('entityCreated', entity);

					delete entity.bypassSmoothing;
				} else {
					ige.network.stop();
					ige.stop();

					IgeStreamComponent.prototype.log(`Network stream cannot create entity with class ${classId} because the class has not been defined! The engine will now stop.`, 'error');
				}
			}
		} else {
			IgeStreamComponent.prototype.log(`Cannot properly handle network streamed entity with id ${entityId} because it's parent with id ${parentId} does not exist on the scenegraph!`, 'warning');
		}
	},

	_onStreamDestroy: function (data) {
		var entity = ige.$(data[1]);
		var self = this;

		if (entity) {
			// Calculate how much time we have left before the entity
			// should be removed from the simulation given the render
			// latency setting and the current time
			entity.destroy();
			self.emit('entityDestroyed', entity);
		}
	}
});

function arr2hex (byteArray) {
	return Array.from(byteArray, function (byte) {
		return (`0${(byte & 0xFF).toString(16)}`).slice(-2);
	}).join('');
}

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = IgeStreamComponent; }
