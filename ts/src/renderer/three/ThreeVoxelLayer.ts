class ThreeVoxelLayer extends THREE.Group {
	// Make a VoxelMap container class to store the layers?
	// and later chunking etc.
	// Use this to store layers later...
	static layers = [];

	constructor(tileset: THREE.Texture, data: LayerData) {
		super();

		tileset.wrapS = tileset.wrapT = THREE.RepeatWrapping;

		const tileSize = 64;
		const texWidth = tileset.image.width;
		const texHeight = tileset.image.height;
		const tilesInRow = texWidth / tileSize;

		const xStep = tileSize / texWidth;
		const yStep = tileSize / texHeight;

		// Build cells
		const cells = new Map<string, VoxelCell>();
		for (let z = 0; z < data.height; z++) {
			for (let x = 0; x < data.width; x++) {
				cells.set(getKeyFromPos(x, 0, z), {
					position: [x, 0, z],
					type: data.data[z * data.width + x],
					visible: true,
					// hiddenFaces: 0x000000,
					hiddenFaces: [false, false, false, false, false, false],
				});
			}
		}

		// Prune cells
		const prunedCells = pruneCells(cells);

		// Build mesh
		const dat = buildMeshDataFromCells(prunedCells, tilesInRow, xStep, yStep);

		const geo = new THREE.BufferGeometry();
		geo.setIndex(dat.indices);
		geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dat.positions), 3));
		geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(dat.uvs), 2));
		geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(dat.normals), 3));
		const mat = new THREE.MeshBasicMaterial({ transparent: true, map: tileset });
		const mesh = new THREE.Mesh(geo, mat);
		this.add(mesh);
	}
}

function getKeyFromPos(x: number, y: number, z: number) {
	return `${x}.${y}.${z}`;
}

function pruneCells(cells) {
	const prunedVoxels = new Map<string, VoxelCell>();
	console.log('0.0.0' in cells.keys());
	for (let k of cells.keys()) {
		const curCell = cells.get(k);

		const k1 = getKeyFromPos(curCell.position[0] + 1, curCell.position[1], curCell.position[2]);
		const k2 = getKeyFromPos(curCell.position[0] - 1, curCell.position[1], curCell.position[2]);
		const k3 = getKeyFromPos(curCell.position[0], curCell.position[1] + 1, curCell.position[2]);
		const k4 = getKeyFromPos(curCell.position[0], curCell.position[1] - 1, curCell.position[2]);
		const k5 = getKeyFromPos(curCell.position[0], curCell.position[1], curCell.position[2] + 1);
		const k6 = getKeyFromPos(curCell.position[0], curCell.position[1], curCell.position[2] - 1);

		const keys = [k1, k2, k3, k4, k5, k6];
		let visible = false;
		for (let i = 0; i < 6; ++i) {
			const faceHidden = cells.has(keys[i]);
			curCell.hiddenFaces[i] = faceHidden;

			if (!faceHidden) {
				visible = true;
			}
		}

		if (visible) {
			prunedVoxels.set(k, curCell);
		}
	}
	return prunedVoxels;
}

function buildMeshDataFromCells(cells, tilesInRow, xStep, yStep) {
	const pxGeometry = new THREE.PlaneGeometry(1, 1);
	pxGeometry.rotateY(Math.PI / 2);
	pxGeometry.translate(0.5, 0, 0);

	const nxGeometry = new THREE.PlaneGeometry(1, 1);
	nxGeometry.rotateY(-Math.PI / 2);
	nxGeometry.translate(-0.5, 0, 0);

	const pyGeometry = new THREE.PlaneGeometry(1, 1);
	pyGeometry.rotateX(-Math.PI / 2);
	pyGeometry.translate(0, 0.5, 0);

	const nyGeometry = new THREE.PlaneGeometry(1, 1);
	nyGeometry.rotateX(Math.PI / 2);
	nyGeometry.translate(0, -0.5, 0);

	const pzGeometry = new THREE.PlaneGeometry(1, 1);
	pzGeometry.translate(0, 0, 0.5);

	const nzGeometry = new THREE.PlaneGeometry(1, 1);
	nzGeometry.rotateY(Math.PI);
	nzGeometry.translate(0, 0, -0.5);

	const invertUvs = [pxGeometry, nxGeometry, pzGeometry, nzGeometry];
	for (let geo of invertUvs) {
		for (let i = 0; i < geo.attributes.uv.array.length; i += 2) {
			geo.attributes.uv.array[i + 1] = 1.0 - geo.attributes.uv.array[i + 1];
		}
	}

	const geometries = [pxGeometry, nxGeometry, pyGeometry, nyGeometry, pzGeometry, nzGeometry];

	const meshes = {
		positions: [],
		uvs: [],
		normals: [],
		indices: [],
	};

	for (let c of cells.keys()) {
		const curCell = cells.get(c);

		for (let i = 0; i < 6; ++i) {
			if (curCell.hiddenFaces[i]) {
				continue;
			}

			const targetData = meshes;

			const bi = targetData.positions.length / 3;
			const localPositions = [...geometries[i].attributes.position.array];
			for (let j = 0; j < 3; ++j) {
				for (let v = 0; v < 4; ++v) {
					localPositions[v * 3 + j] += curCell.position[j] + curCell.position[j];
				}
			}
			targetData.positions.push(...localPositions);

			const xIdx = (curCell.type % tilesInRow) - 1;
			const yIdx = Math.floor(curCell.type / tilesInRow);
			const xOffset = xStep * xIdx;
			const yOffset = 1 - yStep * yIdx - yStep;

			geometries[i].attributes.uv.array[0] = xOffset;
			geometries[i].attributes.uv.array[1] = yOffset;
			geometries[i].attributes.uv.array[2] = xOffset + xStep;
			geometries[i].attributes.uv.array[3] = yOffset;
			geometries[i].attributes.uv.array[4] = xOffset;
			geometries[i].attributes.uv.array[5] = yOffset + yStep;
			geometries[i].attributes.uv.array[6] = xOffset + xStep;
			geometries[i].attributes.uv.array[7] = yOffset + yStep;

			targetData.uvs.push(...geometries[i].attributes.uv.array);
			targetData.normals.push(...geometries[i].attributes.normal.array);

			const localIndices = [...geometries[i].index.array];
			for (let j = 0; j < localIndices.length; ++j) {
				localIndices[j] += bi;
			}
			targetData.indices.push(...localIndices);
		}
	}

	return meshes;
}

type LayerData = {
	id: number;
	name: string;
	type: 'tilelayer' | 'objectgroup';
	width: number;
	height: number;
	data: number[];
};

type VoxelCell = {
	position: number[];
	type: number;
	visible: boolean;
	// hiddenFaces: number;
	hiddenFaces: boolean[];
};
