TaroFilters.emboss = function (canvas, ctx, originalImage, texture, data) {
	// Apply the filter and then put the new pixel data
	ctx.putImageData(
		TaroFilters._convolute(
			ctx.getImageData(
				0,
				0,
				canvas.width,
				canvas.height
			),
			[
				-2, -1, 0,
				-1, 1, 1,
				0, 1, 2
			]
		),
		0,
		0
	);
};
