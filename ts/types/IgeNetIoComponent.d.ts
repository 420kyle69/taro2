declare class IgeNetIoComponent extends IgeEventingClass implements IgeNetIoClient {
	id(): string;

	stream: IgeStreamComponent;

	send(commandName: string, data: any): void;
}
