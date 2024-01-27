import { GameScene } from '@/scenes';
import { Block, Item, Tool } from '.';

export default class ItemGameObject extends Phaser.GameObjects.Sprite {
    constructor(scene: GameScene, private item: Item.Type) {
        const realItem = item.getItem();
        const isBlock = realItem instanceof Block;
        super(scene, 0, 0, isBlock ? 'blocks' : 'items', realItem.texture);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.scene.physics.add.collider(this, scene.worldMap.layers.ground);

        if (isBlock) {
            this.setDisplaySize(15, 15);
        }

        if (realItem instanceof Tool) {
            this.setDisplaySize(26, 26);
        }
    }

    public getItem() {
        return this.item;
    }
}
