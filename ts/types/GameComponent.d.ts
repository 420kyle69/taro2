interface EntityData {
	cellSheet: {
		columnCount: number;
		rowCount: number;
		url: string;
	},
	animations: Record<string, {
		frames: number[];
		framesPerSecond: number;
		loopCount: number;
		name: string;
	}>
}

declare class GameComponent extends IgeEntity {

	data: {
		defaultData: any;
		map: {
			width: number,
			height: number,
			tilesets: {
				image: string;
				margin: number;
				name: string;
				spacing: number;
				tilecount: number;
				tileheight: number;
				tilewidth: number;
			}[];
			layers: {
				data: number[];
				name: string;
				width: number,
				height: number,
				id: number,
				type: 'tilelayer' | 'objectgroup';
			}[];
		};
		unitTypes: Record<string, EntityData>;
		projectileTypes: Record<string, EntityData>;
		itemTypes: Record<string, EntityData>;
		settings: {
			addStrokeToNameAndAttributes: boolean;
			camera: {
				zoom : {
					default:number;
				}
			}
		}
	};

}
