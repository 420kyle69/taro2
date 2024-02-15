class ThreeTileset {
	originalWidth: number;
	originalHeight: number;
	columns: number;
	width: number;
	height: number;

	constructor(
		public texture: THREE.Texture,
		public tileWidth: number,
		public tileHeight: number
	) {
		this.originalWidth = texture.image.width;
		this.originalHeight = texture.image.height;
		this.columns = Math.floor(texture.image.width / tileWidth);
		texture.image = resizeImageToPowerOf2(texture.image);
		this.width = texture.image.width;
		this.height = texture.image.height;
		texture.generateMipmaps = false;
	}
}

function resizeImageToPowerOf2(image) {
	const ceil = THREE.MathUtils.ceilPowerOfTwo;

	const width = ceil(image.width);
	const height = ceil(image.height);

	const canvas = document.createElement('canvas');

	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext('2d');
	context.drawImage(image, 0, 0, width, height, 0, 0, width, height);

	return canvas;
}
