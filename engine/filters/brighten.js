TaroFilters.brighten = function (canvas, ctx, originalImage, texture, data) {
	// Apply the filter and then put the new pixel data
	ctx.putImageData(
		TaroFilters._brighten(
			ctx.getImageData(
				0,
				0,
				canvas.width,
				canvas.height
			),
			texture,
			data
		),
		0,
		0
	);
};

TaroFilters._brighten = function (imageData, texture, data) {
	var arr;
	var arrCount;
	var i; var adjustment = texture.data('TaroFilters.brighten.value') || data.value;

	arr = imageData.data;
	arrCount = arr.length;

	for (i = 0; i < arrCount; i += 4) {
		arr[i] += adjustment;
		arr[i + 1] += adjustment;
		arr[i + 2] += adjustment;
	}

	return imageData;
};
