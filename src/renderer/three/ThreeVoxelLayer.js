class ThreeVoxelLayer extends THREE.Group {
    constructor(tileset, data) {
        super();
        tileset.wrapS = tileset.wrapT = THREE.RepeatWrapping;
        const tileSize = 64;
        const texWidth = tileset.image.width;
        const texHeight = tileset.image.height;
        const tilesInRow = texWidth / tileSize;
        const xStep = tileSize / texWidth;
        const yStep = tileSize / texHeight;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ transparent: true });
        material.map = tileset;
        material.needsUpdate = true;
        const cube = new THREE.Mesh(geometry, material);
        const createCube = (tile) => {
            const newCube = cube.clone();
            newCube.material = newCube.material.clone();
            const xIdx = (tile % tilesInRow) - 1;
            const yIdx = Math.floor(tile / tilesInRow);
            newCube.material.map = newCube.material.map.clone();
            newCube.material.map.repeat.set(tileSize / texWidth, tileSize / texHeight);
            newCube.material.map.offset.x = xStep * xIdx;
            newCube.material.map.offset.y = 1 - yStep * yIdx - yStep;
            return newCube;
        };
        for (let z = 0; z < data.height; z++) {
            for (let x = 0; x < data.width; x++) {
                const cube = createCube(data.data[z * data.width + x]);
                cube.position.set(x, 0, z);
                this.add(cube);
                // layers[data.name].add(cube);
            }
        }
    }
}
// Make a VoxelMap container class to store the layers?
// and later chunking etc.
// Use this to store layers later...
ThreeVoxelLayer.layers = [];
//# sourceMappingURL=ThreeVoxelLayer.js.map