declare class Item extends IgeEntityPhysics {
	script: any;

	constructor (data:any);
	anchoredOffset: OffsetData;

	getAnchoredOffset (rotate: number): OffsetData;
}
