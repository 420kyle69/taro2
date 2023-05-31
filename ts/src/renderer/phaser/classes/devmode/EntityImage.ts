class EntityImage {
  image: Phaser.GameObjects.Image;

  startDragX: number;
  startDragY: number;
  scale: any;

  constructor(scene, devModeTools, entitiesOnInit, action: ActionData) {

    let key;

    if (action.entityType === 'unitTypes') {
        const entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
        key = `unit/${entityTypeData.cellSheet.url}`
    } else if (action.entityType === 'itemTypes') {
        const entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
        key = `item/${entityTypeData.cellSheet.url}`
    } else if (action.entityType === 'projectileTypes') {
        const entityTypeData = taro.game.data[action.entityType] && taro.game.data[action.entityType][action.entity];
        key = `projectile/${entityTypeData.cellSheet.url}`
    }

    const image = this.image = scene.add.image(action.position?.x, action.position?.y, key);
    image.angle = Number(action.angle);
    image.setDisplaySize(action.width, action.height);
    image.setTint(0x9CA3AF);
    image.setAlpha(0.75);
    image.setVisible(false);
    image.setInteractive({ draggable: true });
    entitiesOnInit.push(image);

    this.image.on('pointerdown', () => {
        console.log('pointerdown', action);
    });

    scene.input.on('dragstart', (pointer, gameObject) => {
      this.startDragX = gameObject.x;
      this.startDragY = gameObject.y;

      this.scale = gameObject.scale;
    });

    scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      console.log(this.startDragX - dragX, this.startDragY - dragY)
      if (!devModeTools.altKey.isDown && !devModeTools.shiftKey.isDown) {
          gameObject.x = dragX;
          gameObject.y = dragY;
      } else if (devModeTools.altKey.isDown) {
          const target = Phaser.Math.Angle.BetweenPoints(gameObject, {x: dragX, y: dragY});
          gameObject.rotation = target;
      } else if (devModeTools.shiftKey.isDown) {
          const dragScale = Math.min(500, Math.max(-250, (this.startDragY - dragY)));
          gameObject.scale = this.scale + this.scale * dragScale / 500;
      }
    });
  }
}