var taroCoreConfig = {
	/* Includes for the main taro loader. Flags are indicated as:
	 * c = client
	 * s = server
	 * a =
	 * p = prototype
	 */
	include: [
		/* Client-Side Stack Trace Support */
		['c', 'TaroStackTrace', 'components/stackTrace/lib_stack.js'],
		/* The taro Core Files */
		['csap', 'TaroBase', 'core/TaroBase.js'],
		['csap', 'TaroClass', 'core/TaroClass.js'],
		['csap', 'TaroEventingClass', 'core/TaroEventingClass.js'],
		/* Data Classes */
		['csap', 'TaroPoint2d', 'core/TaroPoint2d.js'],
		['csap', 'TaroPoint3d', 'core/TaroPoint3d.js'],
		['csap', 'TaroPoly2d', 'core/TaroPoly2d.js'],
		['csap', 'TaroRect', 'core/TaroRect.js'],
		['csap', 'TaroMatrix2d', 'core/TaroMatrix2d.js'],
		/* Components */
		['csap', 'TaroTimeComponent', 'components/TaroTimeComponent.js'],
		['csap', 'TaroAnimationComponent', 'components/TaroAnimationComponent.js'],
		['csap', 'TaroVelocityComponent', 'components/TaroVelocityComponent.js'],
		['csap', 'TaroTweenComponent', 'components/TaroTweenComponent.js'],
		['csap', 'TaroPathComponent', 'components/TaroPathComponent.js'],
		['csap', 'TaroInputComponent', 'components/TaroInputComponent.js'],
		['csap', 'TaroTiledComponent', 'components/TaroTiledComponent.js'],
		['csap', 'TaroUiManagerComponent', 'components/TaroUiManagerComponent.js'],
		/* Network Stream */
		['csap', 'TaroTimeSyncExtension', 'components/network/TaroTimeSyncExtension.js'],
		['csap', 'TaroStreamComponent', 'components/network/stream/TaroStreamComponent.js'],
		/* Socket.io */
		// ['cap', 'SocketIo', 'components/network/socket.io/client/socket.io.min.js'],
		['cap', 'TaroSocketIoClient', 'components/network/socket.io/TaroSocketIoClient.js'],
		['sap', 'TaroSocketIoServer', 'components/network/socket.io/TaroSocketIoServer.js'],
		['csap', 'TaroSocketIoComponent', 'components/network/socket.io/TaroSocketIoComponent.js'],
		/* Net.io */
		['cap', 'NetIo', 'components/network/net.io/net.io-client/index.js'],
		['cap', 'TaroNetIoClient', 'components/network/net.io/TaroNetIoClient.js'],
		['sap', 'TaroNetIoServer', 'components/network/net.io/TaroNetIoServer.js'],
		['csap', 'TaroNetIoComponent', 'components/network/net.io/TaroNetIoComponent.js'],
		/* Chat System */
		['cap', 'TaroChatClient', 'components/chat/TaroChatClient.js'],
		['sap', 'TaroChatServer', 'components/chat/TaroChatServer.js'],
		['csap', 'TaroChatComponent', 'components/chat/TaroChatComponent.js'],
		/* MySQL Support */
		['sap', 'TaroMySql', 'components/database/mysql/TaroMySql.js'],
		['sap', 'TaroMySqlComponent', 'components/database/mysql/TaroMySqlComponent.js'],
		/* MongoDB Support */
		['sap', 'TaroMongoDb', 'components/database/mongodb/TaroMongoDb.js'],
		['sap', 'TaroMongoDbComponent', 'components/database/mongodb/TaroMongoDbComponent.js'],
		/* CocoonJS Support */
		['csap', 'TaroCocoonJsComponent', 'components/cocoonjs/TaroCocoonJsComponent.js'],
		/* General Extensions */
		['csap', 'TaroUiPositionExtension', 'extensions/TaroUiPositionExtension.js'],
		['csap', 'TaroUiStyleExtension', 'extensions/TaroUiStyleExtension.js'],
		/* Main Engine Classes */
		['csap', 'TaroFSM', 'core/TaroFSM.js'],
		['csap', 'TaroSceneGraph', 'core/TaroSceneGraph.js'],
		['csap', 'TaroBaseScene', 'core/TaroBaseScene.js'],
		['csap', 'TaroDummyCanvas', 'core/TaroDummyCanvas.js'],
		['csap', 'TaroDummyContext', 'core/TaroDummyContext.js'],
		['csap', 'TaroPathNode', 'core/TaroPathNode.js'],
		['csap', 'TaroPathFinder', 'core/TaroPathFinder.js'],
		['csap', 'TaroTween', 'core/TaroTween.js'],
		['csap', 'TaroTexture', 'core/TaroTexture.js'],
		['csap', 'TaroCellSheet', 'core/TaroCellSheet.js'],
		['csap', 'TaroSpriteSheet', 'core/TaroSpriteSheet.js'],
		['csap', 'TaroFontSheet', 'core/TaroFontSheet.js'],
		['csap', 'TaroFontSmartTexture', 'assets/TaroFontSmartTexture.js'],
		['csap', 'TaroObject', 'core/TaroObject.js'],
		['csap', 'TaroEntity', 'core/TaroEntity.js'],
		['csap', 'TaroUiEntity', 'core/TaroUiEntity.js'],
		['csap', 'TaroUiElement', 'core/TaroUiElement.js'],
		['csap', 'TaroFontEntity', 'core/TaroFontEntity.js'],
		['csap', 'TaroParticleEmitter', 'core/TaroParticleEmitter.js'],
		['csap', 'TaroParticle', 'core/TaroParticle.js'],
		['csap', 'TaroMap2d', 'core/TaroMap2d.js'],
		['csap', 'TaroTileMap2d', 'core/TaroTileMap2d.js'],
		['csap', 'TaroTextureMap', 'core/TaroTextureMap.js'],
		['csap', 'TaroTileMap2dSmartTexture', 'assets/TaroTileMap2dSmartTexture.js'],
		['csap', 'TaroCollisionMap2d', 'core/TaroCollisionMap2d.js'],
		['csap', 'TaroCamera', 'core/TaroCamera.js'],
		['csap', 'TaroViewport', 'core/TaroViewport.js'],
		['csap', 'TaroScene2d', 'core/TaroScene2d.js'],
		['csap', 'TaroQuest', 'core/TaroQuest.js'],
		['csap', 'TaroInterval', 'core/TaroInterval.js'],
		['csap', 'TaroTimeout', 'core/TaroTimeout.js'],
		['csap', 'TaroCuboidSmartTexture', 'assets/TaroCuboidSmartTexture.js'],
		['csap', 'TaroCuboid', 'primitives/TaroCuboid.js'],
		['csap', 'TaroArray', 'core/TaroArray.js'],
		/* Audio Components */
		['csap', 'TaroAudioComponent', 'components/audio/TaroAudioComponent.js'],
		['csap', 'TaroAudio', 'components/audio/TaroAudio.js'],
		/* UI Classes */
		['csap', 'TaroUiDropDown', 'ui/TaroUiDropDown.js'],
		['csap', 'TaroUiButton', 'ui/TaroUiButton.js'],
		['csap', 'TaroUiRadioButton', 'ui/TaroUiRadioButton.js'],
		['csap', 'TaroUiProgressBar', 'ui/TaroUiProgressBar.js'],
		['csap', 'TaroUiTextBox', 'ui/TaroUiTextBox.js'],
		['csap', 'TaroUiLabel', 'ui/TaroUiLabel.js'],
		['csap', 'TaroUiTooltip', 'ui/TaroUiTooltip.js'],
		['csap', 'TaroUiMenu', 'ui/TaroUiMenu.js'],
		/* Image Filters */
		['cap', 'TaroFilters', 'core/TaroFilters.js'],
		['cap', 'TaroFilters._convolute', 'filters/convolute.js'],
		['cap', 'TaroFilters.greyScale', 'filters/greyScale.js'],
		['cap', 'TaroFilters.brighten', 'filters/brighten.js'],
		['cap', 'TaroFilters.threshold', 'filters/threshold.js'],
		['cap', 'TaroFilters.sharpen', 'filters/sharpen.js'],
		['cap', 'TaroFilters.blur', 'filters/blur.js'],
		['cap', 'TaroFilters.emboss', 'filters/emboss.js'],
		['cap', 'TaroFilters.edgeDetect', 'filters/edgeDetect.js'],
		['cap', 'TaroFilters.edgeEnhance', 'filters/edgeEnhance.js'],
		['cap', 'TaroFilters.outlineDetect', 'filters/outlineDetect.js'],
		['cap', 'TaroFilters.colorOverlay', 'filters/colorOverlay.js'],
		['cap', 'TaroFilters.sobel', 'filters/sobel.js'],
		['cap', 'TaroFilters.invert', 'filters/invert.js'],
		['cap', 'TaroFilters.glowMask', 'filters/glowMask.js'],
		/* Engine Actual */
		['csap', 'TaroEngine', 'core/TaroEngine.js'],
		/* Physics Libraries */
		['csap', 'PhysicsComponent', './components/physics/box2d/Box2dComponent.js'],
		['csap', 'TaroEntityPhysics', './components/physics/box2d/TaroEntityPhysics.js'],
		['csap', 'TaroBox2dWorld', './components/physics/box2d/TaroBox2dDebugPainter.js'],
		['csap', 'dists', './components/physics/box2d/dists.js'],
		['csap', 'planck', './components/physics/box2d/dists/planck/planck.js'],
		['csap', 'box2dweb', './components/physics/box2d/dists/box2dweb/lib_box2d.js', 'box2dweb'],
		['csap', 'box2dninja', './components/physics/box2d/dists/box2dweb/box2d_ninja.js', 'box2dninja'],
		['csap', 'box2dts', './components/physics/box2d/dists/flyoverbox2dts/bundle.js'],
		// No crash for now
	]
};

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = taroCoreConfig;
}
