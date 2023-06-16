declare class InGameEditor extends TaroClass {
    getActiveEntity(): {
        id: string;
        player: string;
        entityType: string;
    }
    addNewRegion: any
    updateRegionInReact: any
    mapWasEdited: any
    showClearLayerConfirmation: any
    saveMap: any
    showRegionList: any
    showRepublishToInitEntitiesWarning: any
    toggleEntityPlacementWindow: any
}