namespace Renderer {
	export namespace Three {
		export class Voxels extends Node {
			constructor(
				private topTileset: Tileset,
				private sidesTileset: Tileset
			) {
				super();
			}

			static create(config?: MapData['layers']) {

				const textureRepository = TextureRepository.instance();
				const tilesetMain = taro.getTilesetFromType({ tilesets: taro.game.data.map.tilesets, type: 'top' });
				let tilesetSide = taro.getTilesetFromType({ tilesets: taro.game.data.map.tilesets, type: 'side' });
				if (!tilesetSide) tilesetSide = tilesetMain;

				const texMain = textureRepository.get(tilesetMain.image);
				const texSide = textureRepository.get(tilesetSide.image);

				const topTileset = new Tileset(texMain, tilesetMain.tilewidth, tilesetMain.tilewidth);
				const sidesTileset = new Tileset(texSide, tilesetSide.tilewidth, tilesetSide.tilewidth);

				const voxels = new Voxels(topTileset, sidesTileset);

				if (config) {
					let numTileLayers = 0;
					for (const [idx, layer] of config.entries()) {
						if (layer.type === 'tilelayer' && layer.data) {
							voxels.addLayer(layer, numTileLayers, true, false, (idx + 1) * 100);
							numTileLayers++;
						}
					}
				}

				return voxels;
			}

			addLayer(data: LayerData, height: number, transparent = true, flat = false, renderOrder = 0) {
				const voxels = new Map<string, VoxelCell>();

				const allFacesVisible = [false, false, false, false, false, false];
				const onlyBottomFaceVisible = [true, true, true, false, true, true];
				const hiddenFaces = flat ? onlyBottomFaceVisible : allFacesVisible;

				const yOffset = 0.001;

				for (let z = 0; z < data.height; z++) {
					for (let x = 0; x < data.width; x++) {
						let tileId = data.data[z * data.width + x];
						if (tileId <= 0) continue;

						tileId -= 1;

						const pos = { x: x + 0.5, y: height + yOffset * height, z: z + 0.5 };

						voxels.set(getKeyFromPos(pos.x, pos.y, pos.z), {
							position: [pos.x, pos.y, pos.z],
							type: tileId,
							visible: true,
							hiddenFaces: [...hiddenFaces],
						});
					}
				}

				const prunedVoxels = pruneCells(voxels);
				const voxelData = buildMeshDataFromCells(prunedVoxels, this.topTileset);

				const geometry = new THREE.BufferGeometry();
				geometry.setIndex([...voxelData.sidesIndices, ...voxelData.topIndices]);
				geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(voxelData.positions), 3));
				geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(voxelData.uvs), 2));
				geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(voxelData.normals), 3));

				const mat1 = new THREE.MeshBasicMaterial({
					transparent,
					map: this.sidesTileset.texture,
					side: THREE.DoubleSide,
				});
				const mat2 = new THREE.MeshBasicMaterial({ transparent, map: this.topTileset.texture, side: THREE.DoubleSide });

				geometry.addGroup(0, voxelData.sidesIndices.length, 0);
				geometry.addGroup(voxelData.sidesIndices.length, voxelData.topIndices.length, 1);

				const mesh = new THREE.Mesh(geometry, [mat1, mat2]);
				mesh.renderOrder = renderOrder;
				//@ts-ignore
				geometry.computeBoundsTree();

				this.add(mesh);
			}
		}

		function getKeyFromPos(x: number, y: number, z: number) {
			return `${x}.${y}.${z}`;
		}

		function pruneCells(cells) {
			const prunedVoxels = new Map<string, VoxelCell>();
			for (let k of cells.keys()) {
				const curCell = cells.get(k);

				const k1 = getKeyFromPos(curCell.position[0] + 1, curCell.position[1], curCell.position[2]);
				const k2 = getKeyFromPos(curCell.position[0] - 1, curCell.position[1], curCell.position[2]);
				const k3 = getKeyFromPos(curCell.position[0], curCell.position[1] + 1, curCell.position[2]);
				const k4 = getKeyFromPos(curCell.position[0], curCell.position[1] - 1, curCell.position[2]);
				const k5 = getKeyFromPos(curCell.position[0], curCell.position[1], curCell.position[2] + 1);
				const k6 = getKeyFromPos(curCell.position[0], curCell.position[1], curCell.position[2] - 1);

				const neighborKeys = [k1, k2, k3, k4, k5, k6];
				let visible = false;
				for (let i = 0; i < 6; ++i) {
					const hasNeighbor = cells.has(neighborKeys[i]);

					if (hasNeighbor) {
						curCell.hiddenFaces[i] = true;
					}

					if (!hasNeighbor) {
						visible = true;
					}
				}

				if (visible) {
					prunedVoxels.set(k, curCell);
				}
			}
			return prunedVoxels;
		}

		function buildMeshDataFromCells(cells, tileset: Tileset) {
			const xStep = tileset.tileWidth / tileset.width;
			const yStep = tileset.tileHeight / tileset.height;

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

			const invertUvs = [nyGeometry];

			const geometries = [pxGeometry, nxGeometry, pyGeometry, nyGeometry, pzGeometry, nzGeometry];

			const meshes = {
				positions: [],
				uvs: [],
				normals: [],
				topIndices: [],
				sidesIndices: [],
			};

			for (let c of cells.keys()) {
				const curCell = cells.get(c);

				for (let i = 0; i < geometries.length; ++i) {
					if (curCell.hiddenFaces[i]) {
						continue;
					}

					const targetData = meshes;

					const bi = targetData.positions.length / 3;
					const localPositions = [...geometries[i].attributes.position.array];
					for (let j = 0; j < 3; ++j) {
						for (let v = 0; v < 4; ++v) {
							localPositions[v * 3 + j] += curCell.position[j];
						}
					}
					targetData.positions.push(...localPositions);

					const xIdx = curCell.type % tileset.columns;
					const yIdx = Math.floor(curCell.type / tileset.columns);

					const singlePixelOffset = { x: xStep / tileset.tileWidth, y: yStep / tileset.tileHeight };
					const halfPixelOffset = { x: singlePixelOffset.x / 2, y: singlePixelOffset.y / 2 };

					const xOffset = xStep * xIdx + halfPixelOffset.x;
					const yOffset = 1 - yStep * yIdx - yStep - halfPixelOffset.y;

					if (invertUvs.includes(geometries[i])) {
						geometries[i].attributes.uv.array[4] = xOffset;
						geometries[i].attributes.uv.array[5] = yOffset + yStep;

						geometries[i].attributes.uv.array[6] = xOffset + xStep - singlePixelOffset.x;
						geometries[i].attributes.uv.array[7] = yOffset + yStep;

						geometries[i].attributes.uv.array[0] = xOffset;
						geometries[i].attributes.uv.array[1] = yOffset + singlePixelOffset.y;

						geometries[i].attributes.uv.array[2] = xOffset + xStep - singlePixelOffset.x;
						geometries[i].attributes.uv.array[3] = yOffset + singlePixelOffset.y;
					} else {
						geometries[i].attributes.uv.array[0] = xOffset;
						geometries[i].attributes.uv.array[1] = yOffset + yStep;

						geometries[i].attributes.uv.array[2] = xOffset + xStep - singlePixelOffset.x;
						geometries[i].attributes.uv.array[3] = yOffset + yStep;

						geometries[i].attributes.uv.array[4] = xOffset;
						geometries[i].attributes.uv.array[5] = yOffset + singlePixelOffset.y;

						geometries[i].attributes.uv.array[6] = xOffset + xStep - singlePixelOffset.x;
						geometries[i].attributes.uv.array[7] = yOffset + singlePixelOffset.y;
					}

					targetData.uvs.push(...geometries[i].attributes.uv.array);
					targetData.normals.push(...geometries[i].attributes.normal.array);

					const localIndices = [...geometries[i].index.array];
					for (let j = 0; j < localIndices.length; ++j) {
						localIndices[j] += bi;
					}

					// top and bottom face
					if (i === 2 || i === 3) {
						targetData.topIndices.push(...localIndices);
					} else {
						targetData.sidesIndices.push(...localIndices);
					}
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
			hiddenFaces: boolean[];
		};
	}
}
