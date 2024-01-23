import { GameScene } from '@/scenes';
import { Scene } from 'phaser';

export default class Destroy extends Phaser.GameObjects.Sprite {
    private health = 1;

    constructor(scene: Scene, public tile: Phaser.Tilemaps.Tile) {
        super(scene, 500, 500, 'destroy', 8);

        scene.add.existing(this);

        this.setScale(2);
        this.setOrigin(0, 0);

        this.setPosition(tile.pixelX, tile.pixelY);
    }

    update(time: number, delta: number) {
        this.health -= (0.5 * delta) / 1000;
        this.setTexture('destroy', Math.floor((1 - this.health) * 8));

        (this.scene as GameScene).marker.setPosition(this.tile.pixelX, this.tile.pixelY);

        if (this.health < 0) {
            this.health = 1;

            this.tile.tilemapLayer?.putTileAt(-1, this.tile.x, this.tile.y);
        }
    }

    // destroy(fromScene?: boolean | undefined): void {
    //     (this.scene as GameScene).marker.hide();
    //     super.destroy(fromScene);
    // }
}
