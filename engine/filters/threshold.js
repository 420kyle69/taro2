TaroFilters.threshold = function (canvas, ctx, originalImage, texture, data) {
	// Apply the filter and then put the new pixel data
	ctx.putImageData(
		TaroFilters._threshold(
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

TaroFilters._threshold = function (imageData, texture, data) {
	var arr;
	var arrCount;
	var i; var r; var g; var b; var v;
	var threshold = texture.data('TaroFilters.threshold.value') || data.value;

	arr = imageData.data;
	arrCount = arr.length;

	for (i = 0; i < arrCount; i += 4) {
		r = arr[i];
		g = arr[i + 1];
		b = arr[i + 2];
		v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
		arr[i] = arr[i + 1] = arr[i + 2] = v;
	}

	return imageData;
};
