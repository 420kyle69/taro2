/* eslint-disable @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars */
class PhaserEntity {

	protected gameObject: TGameObject;
	protected evtListeners: Record<string, EvtListener> = {};

	protected constructor (
		protected entity: IgeEntity
	) {
		Object.assign(this.evtListeners, {
			transform: entity.on('transform', this.transform, this),
			scale: entity.on('scale', this.scale, this),
			hide: entity.on('hide', this.hide, this),
			show: entity.on('show', this.show, this),
			layer: entity.on('layer', this.layer, this),
			depth: entity.on('depth', this.depth, this),
			destroy: entity.on('destroy', this.destroy, this)
		});
	}

	protected transform (data: {
		x: number,
		y: number,
		rotation: number
	}): void { }

	protected scale (data: {
		x: number,
		y: number
	}): void { }

	protected hide (): void {
		this.gameObject.hidden = true;
	}

	protected show (): void {
		this.gameObject.hidden = false;
	}

	protected layer (value: number): void {
		// use index - 1 because taro layers are indexed at 1
		const scene = this.gameObject.scene as GameScene;
		scene.entityLayers[value - 1].add(this.gameObject);
	}

	protected depth (value: number): void {
		const scene = this.gameObject.scene as GameScene;
		this.gameObject.taroDepth = value;

		if (scene.depthRenderer) {
			this.gameObject.setDepth(value + this.gameObject.y / 1000);
		} else {
			this.gameObject.setDepth(value);
		}
	}

	protected destroy (): void {
		Object.keys(this.evtListeners).forEach((key) => {
			this.entity.off(key, this.evtListeners[key]);
			delete this.evtListeners[key];
		});

		this.gameObject.destroy();

		this.gameObject = null;
		this.evtListeners = null;
		this.entity = null;
	}
}

interface IRenderProps {
	hidden: boolean;
	taroDepth: number;
	dynamic?: boolean;
}

type TGameObject =
	Phaser.GameObjects.GameObject &
	Phaser.GameObjects.Components.Transform &
	Phaser.GameObjects.Components.Visible &
	Phaser.GameObjects.Components.Depth &
	IRenderProps
