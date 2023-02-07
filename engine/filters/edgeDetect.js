TaroFilters.edgeDetect = function (canvas, ctx, originalImage, texture, data) {
	if (!texture._filterImageDrawn || !data || !data.cumulative) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(originalImage, 0, 0);
		texture._filterImageDrawn = true;
	}

	var newData = TaroFilters._convolute(
		ctx.getImageData(
			0,
			0,
			canvas.width,
			canvas.height
		),
		[
			-1,	-1,	-1,	-1,	-1,
			-1,	2,	2,	2,	-1,
			-1,	2,	0,	2,	-1,
			-1,	2,	2,	2,	-1,
			-1,	-1,	-1,	-1,	-1
		],
		true
	);
	var arr = newData.data;
	var arrCount = arr.length;
	var i; var r; var g; var b; var v;

	for (i = 0; i < arrCount; i += 4) {
		r = arr[i];
		g = arr[i + 1];
		b = arr[i + 2];

		v = (r + g + b) / 3;
		v *= 1.1;

		v = v >= data.value ? 255 : 0;

		arr[i] = arr[i + 1] = arr[i + 2] = v;
	}

	// Apply the filter and then put the new pixel data
	ctx.putImageData(
		newData,
		0,
		0
	);
};
