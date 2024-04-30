function angleBetweenPoints(x1: number, y1: number, x2: number, y2: number) {
	const deltaY = y2 - y1;
	const deltaX = x2 - x1;
	const angleInRadians = Math.atan2(deltaY, deltaX);
	return angleInRadians;
}
