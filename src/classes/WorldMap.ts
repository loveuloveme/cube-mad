/* eslint-disable @typescript-eslint/no-non-null-assertion */
import getBlockBackground from '@/helpers/get-block-background';
import { Scene } from 'phaser';

export default class WorldMap {
    public tilemap!: Phaser.Tilemaps.Tilemap;
    public layers!: {
        ground: Phaser.Tilemaps.TilemapLayer;
        background: Phaser.Tilemaps.TilemapLayer;
        light: Phaser.Tilemaps.TilemapLayer;
    };

    private lightMap!: Phaser.Tilemaps.Tilemap;
    public lights!: number[][];
    public health!: number[][];

    constructor(scene: Scene) {
        this.tilemap = scene.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = this.tilemap.addTilesetImage('blocks', 'blocks');
        this.lightMap = scene.make.tilemap({ key: 'lightMap' });

        const tx = scene.textures.createCanvas('dark-tile', 32, 32)!;
        tx.context.fillStyle = '#000000';
        tx.context.fillRect(0, 0, 32, 32);
        tx?.refresh();

        this.layers = {
            ground: this.tilemap.createLayer('main', tileset!, 0, 0)!,
            background: this.tilemap.createLayer('background', tileset!, 0)!,
            light: this.lightMap.createBlankLayer(
                'shadow',
                this.lightMap.addTilesetImage('dark-tile')!,
                0,
                0,
                this.tilemap.width,
                this.tilemap.height,
            )!,
        };

        this.layers.ground.forEachTile((tile) => {
            const source = this.layers.background.getTileAt(tile.x, tile.y);

            if (tile.index !== -1) {
                this.layers.light.putTileAt(0, tile.x, tile.y);
            }

            if (!source) {
                // this.layers.background.
                this.layers.background.putTileAt(getBlockBackground(tile.index), tile.x, tile.y);
            }
        });

        this.layers.background.setTint(0x525252);
        this.layers.ground.setDepth(1);
        this.tilemap.setCollisionByExclusion([-1], true, true, 'main');

        // this.layers.light = this.layers.light.fill(0);
        this.layers.light.setDepth(100);
        // this.layers.light.setVisible(false);

        // scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        //     const tile = this.tilemap.getTileAtWorldXY(pointer.worldX, pointer.worldY);
        //     console.log(tile);

        //     if (tile) {
        //         new Destroy(scene).setPosition(tile.pixelX, tile.pixelY);
        //     }
        // });

        this.health = new Array(this.tilemap.width)
            .fill(0)
            .map((_) => new Array(this.tilemap.height).fill(1));
        this.resetLight();
    }

    private min = 1;
    private max = 1;

    private resetLight(): void {
        this.lights = new Array(this.tilemap.width)
            .fill(0)
            .map((_) => new Array(this.tilemap.height).fill(this.min));
    }

    public setLight(v: number, x: number, y: number) {
        this.lights[x][y] = v;

        if (this.lights[x][y] < this.min) this.lights[x][y] = this.min;
        if (this.lights[x][y] > this.max) this.lights[x][y] = this.max;
    }

    public addLight(v: number, x: number, y: number) {
        this.setLight(this.lights[x][y] + v, x, y);
    }

    update() {
        this.layers.light.forEachTile((tile) => {
            //tile.alpha = 0;
        });

        this.layers.ground.forEachTile((tile) => {
            const shadowTile = this.layers.light?.getTileAt(tile.x, tile.y);

            if (shadowTile) {
                shadowTile.alpha = tile.index === -1 ? 0 : 1 - this.lights[tile.x][tile.y];
            }
        });

        this.resetLight();
    }
}
