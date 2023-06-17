declare class InGameEditor extends TaroClass {
    getActiveEntity(): {
        id: string;
        player: string;
        entityType: string;
    }
    addNewRegion(data: RegionData): void
    updateRegionInReact(data: RegionData): void
    mapWasEdited(): void
    showClearLayerConfirmation(data: {
        gid: number,
        layer: number,
        layerName: string,
        x: number,
        y: number,
        tool: string
    }): void
    saveMap(): void
    showRegionList(data: RegionData[]): void
    showRepublishToInitEntitiesWarning(): void
    toggleEntityPlacementWindow(boolean): void
}