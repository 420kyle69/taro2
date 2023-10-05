class PhaserScene extends Phaser.Scene {

	patchAssetUrl (url: string): string {
		
		// proxy all s3 requests via cloudflare, old-cache.modd.io points to same 'modd' s3 bucket
		if (url?.startsWith('https://modd.s3.amazonaws.com')) {
			url = url.replace('https://modd.s3.amazonaws.com', 'https://old-cache.modd.io');
		}

		const shouldOptimize = new URL(window.location.href).searchParams.get('optimize');
		if (shouldOptimize && (url?.indexOf('.png') !== -1 || url?.indexOf('.jpg') !== -1)) {
			// load images via Image tag, helps CF optimize and convert(to webp) images via Polish - https://newdocs.phaser.io/docs/3.60.0/focus/Phaser.Loader.LoaderPlugin-image
			this.load.imageLoadType = 'HTMLImageElement';

			// use cache2 and old-cache2 endpoints for images which serve cached and optimized images 
			url = url.replace('https://cache.modd.io', 'https://cache2.modd.io');
			url = url.replace('https://old-cache.modd.io', 'https://old-cache2.modd.io');
			
		} else {
			// default loader type
			this.load.imageLoadType = 'XHR';
		}
		
		// https://stackoverflow.com/a/37455118
		return `${url}?v=1`;
	}
}
