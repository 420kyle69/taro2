declare class IgeEngine extends IgeClass {
	tiled: any;
	regionManager: any;
	scaleMap(data: any): void;

	_renderFrames: number;
	_tickStart: number;

	_currentTime: number;
	_cullCounter: number;

	env: string;

	isClient: boolean;
	isServer: boolean;

	isMobile: boolean;

	client: Client;
	server: Client;

	network: IgeNetIoComponent;

	input: IgeInputComponent;

	mobileControls: MobileControlsComponent;

	gameLoopTickHasExecuted: boolean;

	game: GameComponent;

	renderer: PhaserRenderer;

	developerMode: DeveloperMode;

	scaleMapDetails: {
		scaleFactor: {
			x: number;
			y: number;
		};
		shouldScaleTilesheet: boolean;
		tileWidth: number;
		tileHeight: number;
		originalTileHeight: number;
		originalTileWidth: number;
	};

	lastTickTime: number;

	entitiesToRender: EntitiesToRender;
	triggersQueued: any[];

	constructor(options: object);

	createFrontBuffer (autoSize: boolean, dontScale?: boolean): void
	engineStep (): void;

	physics: {
		staticsFromMap(walls: any): unknown;
		destroyWalls(): unknown;
		world(): any;
		engine: string;
		_scaleRatio: number
	};

	$ (item: number | string | object): any;

	addNewRegion : any
	updateRegionInReact: any
}
