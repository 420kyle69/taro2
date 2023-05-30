class EntityImage {
    image: Phaser.GameObjects.Image;

  constructor(scene, entitiesOnInit, action: ActionData) {

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
    image.setInteractive();
    entitiesOnInit.push(image);

    this.image.on('pointerdown', () => {
      console.log('pointerdown', action);
    });
  }
}