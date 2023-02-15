/**
 * When added to a viewport, automatically adds entity rotate
 * capabilities to the selected entity in the scenegraph viewer.
 */
var TaroEditorRotateComponent = TaroEventingClass.extend({
	classId: 'TaroEditorRotateComponent',
	componentId: 'editorRotate',

	/**
	 * @constructor
	 * @param {TaroObject} entity The object that the component is added to.
	 * @param {Object=} options The options object that was passed to the component during
	 * the call to addComponent.
	 */
	init: function (entity, options) {
		this._entity = entity;
		this._options = options;

		// Set the rotate component to inactive to start with
		this._enabled = false;
		this._startThreshold = 1; // The number of pixels the mouse should move to activate
	},

	/**
	 * Gets / sets the number of pixels after a mouse down that the mouse
	 * must move in order to activate the operation. Defaults to 1.
	 * @param val
	 * @return {*}
	 */
	startThreshold: function (val) {
		if (val !== undefined) {
			this._startThreshold = val;
			return this._entity;
		}

		return this._startThreshold;
	},

	/**
	 * Gets / sets the rectangle that the operation will be limited
	 * to using an TaroRect instance.
	 * @param {TaroRect=} rect
	 * @return {*}
	 */
	limit: function (rect) {
		if (rect !== undefined) {
			this._limit = rect;
			return this._entity;
		}

		return this._limit;
	},

	/**
	 * Gets / sets the enabled flag. If set to true,
	 * operations will be processed. If false, no operations will
	 * occur.
	 * @param {Boolean=} val
	 * @return {*}
	 */
	enabled: function (val) {
		var self = this;

		if (val !== undefined) {
			this._enabled = val;

			// Reset rotate values.
			// This prevents problems if the component is disabled mid-operation.
			this._opPreStart = false;
			this._opStarted = false;

			if (this._enabled) {
				if (taro._sgTreeSelected && taro._sgTreeSelected !== 'taro') {
					this._targetEntity = taro.$(taro._sgTreeSelected);

					if (this._targetEntity.classId() == 'TaroViewport') {
						// Disable translation mode
						this.log('Editor: Mouse rotate disabled');
						this.enabled(false);
					} else {
						// Listen for the mouse events we need to operate
						taro.input.on('mouseDown', function (event) { self._mouseDown(event); });
						taro.input.on('mouseMove', function (event) { self._mouseMove(event); });
						taro.input.on('mouseUp', function (event) { self._mouseUp(event); });
						this.log('Editor: Mouse rotate enabled');
					}
				}
			} else {
				// Remove the operation start data
				delete this._opStartMouse;
				delete this._opStartRotate;
			}

			return this._entity;
		}

		return this._enabled;
	},

	/**
	 * Handles the mouseDown event. Records the starting position of the
	 * operation and the current operation translation.
	 * @param event
	 * @private
	 */
	_mouseDown: function (event) {
		if (!this._opStarted && this._enabled && this._targetEntity) {
			// Record the mouse down position - pre-start
			var curMousePos = taro._mousePos;
			this._opStartMouse = curMousePos.clone();

			this._opStartRotate = {
				x: Math.degrees(this._targetEntity._rotate.z)
			};

			this._opPreStart = true;
			this._opStarted = false;

			document.getElementById('taroSgEditorStatus').innerHTML = `Degrees: ${Math.degrees(this._targetEntity._rotate.z)}`;
		}
	},

	/**
	 * Handles the mouse move event. Rotates the entity as the mouse
	 * moves across the screen.
	 * @param event
	 * @private
	 */
	_mouseMove: function (event) {
		if (this._enabled && this._targetEntity) {
			// Rotate the camera if the mouse is down
			if (this._opStartMouse) {
				var curMousePos = taro._mousePos;
				var rotateCords = {
					x: this._opStartMouse.x - curMousePos.x
				};
				var distX = rotateCords.x - this._opStartRotate.x;

				if (this._opPreStart) {
					// Check if we've reached the start threshold
					if (Math.abs(distX) > this._startThreshold) {
						this._targetEntity.rotateTo(
							this._targetEntity._rotate.x,
							this._targetEntity._rotate.y,
							Math.radians(-distX)
						);
						this.emit('rotateStart');
						this._opPreStart = false;
						this._opStarted = true;

						this.emit('rotateMove');
					}
				} else {
					// Rotate has already started
					this._targetEntity.rotateTo(
						this._targetEntity._rotate.x,
						this._targetEntity._rotate.y,
						Math.radians(-distX)
					);

					this.emit('rotateMove');
				}

				document.getElementById('taroSgEditorStatus').innerHTML = `Degrees: ${Math.degrees(this._targetEntity._rotate.z)}`;
			}
		}
	},

	/**
	 * Handles the mouse up event. Finishes the entity rotate and
	 * removes the starting operation data.
	 * @param event
	 * @private
	 */
	_mouseUp: function (event) {
		if (this._enabled && this._targetEntity) {
			// End the rotate
			if (this._opStarted) {
				if (this._opStartMouse) {
					var curMousePos = taro._mousePos;
					var rotateCords = {
						x: this._opStartMouse.x - curMousePos.x
					};
					var distX = rotateCords.x - this._opStartRotate.x;

					this._targetEntity.rotateTo(
						this._targetEntity._rotate.x,
						this._targetEntity._rotate.y,
						Math.radians(-distX)
					);

					document.getElementById('taroSgEditorStatus').innerHTML = `Degrees: ${Math.degrees(this._targetEntity._rotate.z)}`;

					// Remove the rotate start data to end the rotate operation
					delete this._opStartMouse;
					delete this._opStartRotate;

					this.emit('rotateEnd');
					this._opStarted = false;
				}
			} else {
				delete this._opStartMouse;
				delete this._opStartRotate;
				this._opStarted = false;
			}
		}
	}
});
