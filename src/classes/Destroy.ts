import { GameScene } from '@/scenes';
import { Block, Stack } from './item';

export default class Destroy extends Phaser.GameObjects.Sprite {
    private health = 1;

    scene!: GameScene;

    constructor(scene: GameScene, public tile: Phaser.Tilemaps.Tile) {
        super(scene, 500, 500, 'destroy', 8);

        scene.add.existing(this);

        this.setScale(2);
        this.setOrigin(0, 0);

        this.setPosition(tile.pixelX, tile.pixelY);
    }

    public isDone() {
        return this.health <= 0;
    }

    update(time: number, delta: number) {
        this.health -= (1 * delta) / 1000;
        this.setTexture('destroy', Math.floor((1 - this.health) * 8));

        (this.scene as GameScene).marker.setPosition(this.tile.pixelX, this.tile.pixelY);
    }

    // destroy(fromScene?: boolean | undefined): void {
    //     (this.scene as GameScene).marker.hide();
    //     super.destroy(fromScene);
    // }
}
