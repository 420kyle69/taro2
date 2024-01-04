interface EntityData {
	scripts?: any;
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
    controls: {
        mouseBehaviour: any;
        abilities: Record<string, ControlAbility>;
        unitAbilities: Record<string, UnitAbility>;
    }
}

interface UnitAbility {
    name: string,
    castDuration: number,
	cooldown: number,
    cost: {
        unitAttributes: Record<string, number>,
        playerAttributes: Record<string, number>
    },
    iconUrl: string,
}

interface ScriptData {
	name: string;
	triggers: Record<string, {
		type: string;
	}>;
	actions: Record<string, ActionData>;
	deleted?: boolean;
}

interface ActionData {
    player?: {
        variableName: string;
        function: string;
    };
    disabled?: boolean;
    unitType?: string;
    itemType?: string;
    projectileType?: string;
    actionId?: string;
	type?: string;
	entity?: string;
	entityType?: string;
	position?: {
        function?: string,
        x: number,
        y: number
    };
	angle?: number;
	width?: number;
	height?: number;
    wasCreated?: boolean;
    wasEdited?: boolean;
    wasDeleted?: boolean;
}

interface VariableData {
	dataType?: string,
	newKey?: string,
	value?: any,
	delete?: boolean
}

interface MapData {
	wasEdited: boolean;
	haveUnsavedChanges: boolean;
	tilewidth: number;
	tileheight: number;
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
}

declare class GameComponent extends TaroEntity {
	lastCreatedUnitId: string;
	cloneAsset(arg0: string, unitTypeId: string): any;
	getPlayerByClientId(clientId: string): Player;

	data: {
		variables: Record<string, VariableData>;
		scripts: Record<string, ScriptData>;
		defaultData: any;
		map: MapData;
		unitTypes: Record<string, EntityData>;
		projectileTypes: Record<string, EntityData>;
		itemTypes: Record<string, EntityData>;
		particleTypes: Record<string, ParticleData>;
		abilities: Record<string, UnitAbility>
		settings: {
			addStrokeToNameAndAttributes: boolean;
			camera: {
				useBounds: boolean;
				trackingDelay: number;
				zoom : {
					default:number;
				}
			}
		}
		heightBasedZIndex: boolean;
		texturePack: any;
	};

	entitiesCollidingWithLastRaycast: TaroEntity[];

}
