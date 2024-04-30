function parse(data) {
	var objLoader = new OBJLoader();
	return objLoader.parse(data);
}
function load(path) {
	var objLoader = new OBJLoader();
	return new Promise((resolve) => {
		objLoader.load(
			path,
			(object) => {
				resolve(object);
			},
			(xhr) => {
				// console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
			},
			(error) => {
				console.error('An error happened', error);
			}
		);
	});
}
