class UIScene extends PhaserScene {

	constructor() {
		super({ key: 'UI', active: true  });
	}

	init (): void {

		
	}

    create ()
    {
        //  simple score text for testing
        const info = this.add.text(100, 100, 'Score: 0', /*{ font: '48px Arial', fill: '#000000' }*/);
    }

	preload (): void {

	}

	update () {
		
	}
}
