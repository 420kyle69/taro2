/**
 * Provides an alternative to setTimeout() which works based on the engine's internal
 * time system allowing timeouts to fire correctly, taking into account pausing the
 * game and differences in rendering speed etc.
 */
var TaroTimeout = TaroInterval.extend({
	classId: 'TaroTimeout',

	/**
	 * Creates a new timeout that will call the passed method after the number of
	 * milliseconds specified by the timeout parameter has been reached.
	 * @param {Function} method The method to call on timeout.
	 * @param {Number} timeout The number of milliseconds before the timeout.
	 */
	init: function (method, timeout) {
		TaroInterval.prototype.init.call(this, method, timeout);
	},

	/**
     * Cancels the timer, stops the timeout.
     * @returns {*}
     */
	cancel: function () {
		return TaroInterval.prototype.cancel.call(this);
	},

	/**
     * Resets the time and lets the timeout begin anew.
     * @returns {*}
     */
	reset: function () {
		this._time = 0;
		if (taro.time._timers.indexOf(this) == -1) {
			taro.time.addTimer(this);
		}
	},

	/**
	 * Checks for a timeout event to see if we should call the timeout method. This is
	 * called automatically by the TaroTimeComponent class and does not need to be
	 * called manually.
	 * @returns {*}
	 */
	update: function () {
		if (this._time > this._interval) {
			// Fire an interval
			this._method(taro._currentTime);
			taro.time.removeTimer(this);
		}

		return this;
	}
});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = TaroTimeout; }
