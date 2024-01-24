import { GameScene } from '@/scenes';
import { Scene } from 'phaser';
import Destroy from './Destroy';

export default class Marker extends Phaser.GameObjects.Graphics {
    scene!: GameScene;

    map: Phaser.Tilemaps.Tilemap;

    constructor(scene: GameScene) {
        super(scene);

        const { tileWidth, tileHeight } = scene.worldMap.tilemap;
        this.map = scene.worldMap.tilemap;

        this.lineStyle(2, 0xffffff, 1);
        this.strokeRect(0, 0, tileWidth, tileHeight);

        this.setDepth(10000);
        scene.add.existing(this);
    }

    setToTile(tile: Phaser.Tilemaps.Tile): void {
        this.setPosition(tile.pixelX, tile.pixelY);
    }

    public hide(): void {
        this.setPosition(-10000, -10000);
    }

    public isHidden(): boolean {
        return this.x === -10000 && this.y === -10000;
    }

    update(...args: any[]): void {
        // const worldPoint = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main);
        // const pointerTileX = this.map.worldToTileX(worldPoint.x);
        // const pointerTileY = this.map.worldToTileY(worldPoint.y);
        // const tile = this.map.getTileAt(pointerTileX, pointerTileY);
        // const nearest = [
        //     [-1, -1],
        //     [0, 1],
        //     [1, 1],
        //     [0, -1],
        //     [0, 0],
        // ];
        // const isNear = nearest.some((near) =>
        //     this.map.getTileAt(pointerTileX + near[0], pointerTileY + near[1]),
        // );
        // this.x = this.map.tileToWorldX(pointerTileX);
        // this.y = this.map.tileToWorldY(pointerTileY);
        // this.visible = isNear;
        // this.clouds.tilePositionX -= 0.01;
        //this.cameras.main.setZoom(this.cameras.main.zoom + 0.0005);
    }
}
