declare class TaroNetIoComponent extends TaroEventingClass implements TaroNetIoClient {
	id(): string;

	stream: TaroStreamComponent;

	send<T extends keyof MapEditTool = any>(commandName: string, data: TileData<T> | boolean): void;
}
