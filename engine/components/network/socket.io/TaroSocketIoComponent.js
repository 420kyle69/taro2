var TaroSocketIoComponent = TaroEventingClass.extend([
	{ extension: TaroTimeSyncExtension, overwrite: false }
], {
	classId: 'TaroSocketIoComponent',
	componentId: 'network',

	init: function (entity, options) {
		this._entity = entity;
		this._options = options;

		// Setup the network commands storage
		this._networkCommands = {};
		this._networkCommandsIndex = [];
		this._networkCommandsLookup = {};

		// Set some defaults
		this._port = 8000;
		this._debug = false;
		this._debugMax = 0;
		this._clientRooms = {};

		// Time sync defaults
		this._timeSyncInterval = 10000; // Sync the client/server clocks every ten seconds by default
		this._timeSyncLog = {};
		this._latency = 0;

		/* CEXCLUDE */
		if (taro.isServer) {
			this.implement(TaroSocketIoServer);
			this._socketio = require(`../../../${modulePath}socket.io`);
			this._acceptConnections = false;
		}
		/* CEXCLUDE */

		if (taro.isClient) {
			this._socketio = TaroSocketIoClient;
			this.implement(TaroSocketIoClient);
		}

		this.log(`Network component initiated with socket.io version: ${this._socketio.version}`);
	},

	/**
	 * Gets / sets debug flag that determines if debug output
	 * is logged to the console.
	 * @param {Boolean=} val
	 * @return {*}
	 */
	debug: function (val) {
		if (val !== undefined) {
			this._debug = val;
			return this._entity;
		}

		// Check the debug counter settings
		if (this._debugMax > 0 && this._debugCounter >= this._debugMax) {
			this._debug = false;
			this._debugCounter = 0;
		}

		return this._debug;
	},

	/**
	 * Gets / sets the maximum number of debug messages that
	 * should be allowed to be output to the console before
	 * debugging is automatically turned off. This is useful
	 * if you want to sample a certain number of outputs and
	 * then automatically disable output so your console is
	 * not flooded.
	 * @param {Number=} val Number of debug messages to allow
	 * to be output to the console. Set to zero to allow
	 * infinite amounts.
	 * @return {*}
	 */
	debugMax: function (val) {
		if (val !== undefined) {
			this._debugMax = val;
			return this._entity;
		}

		return this._debugMax;
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = TaroSocketIoComponent; }
