declare class TaroNetIoComponent extends TaroEventingClass implements TaroNetIoClient {
	id(): string;

	stream: TaroStreamComponent;

	disconnect<T>(clientId: string, reason: string, reasonCode: string): void;

	send<T extends keyof MapEditTool = any>(commandName: string, data: TileData<T> | EditEntityData | ScriptChangesData | boolean, clientId?: string): void;
}
