import { GameScene } from '@/scenes';
import ItemGameObject from './item/ItemGameObject';
import { Item } from './item';

export default class DropContainer extends Phaser.GameObjects.Group {
    scene!: GameScene;

    constructor(scene: GameScene) {
        super(scene);

        scene.physics.add.overlap(scene.player, this, this.onCollision, undefined, this);
    }

    private onCollision(
        _,
        drop: Phaser.Tilemaps.Tile | Phaser.Types.Physics.Arcade.GameObjectWithBody,
    ) {
        const itemDrop = drop as ItemGameObject;

        if (this.scene.player.inventory.addItem(itemDrop.getItem())) {
            drop.destroy();
        }
    }

    public createDrop(x: number, y: number, item: Item.Type): ItemGameObject {
        const drop = new ItemGameObject(this.scene, item);
        drop.setPosition(x, y);
        this.add(drop);

        return drop;
    }

    public update(): void {
        this.getChildren().forEach((drop: ItemGameObject) => {});
    }
}
