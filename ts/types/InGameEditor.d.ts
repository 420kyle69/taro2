declare class InGameEditor extends TaroClass {
	getActiveEntity(): {
		id: string;
		player: string;
		entityType: string;
	}
	addNewRegion(data: RegionData): void
	updateRegionInReact(data: RegionData): void
	mapWasEdited(): void
	showClearLayerConfirmation(data: TileData<'clear'>): void
	saveMap(): void
	showRegionList(data: RegionData[]): void
	showRepublishToInitEntitiesWarning(): void
	toggleEntityPlacementWindow(boolean): void
}
