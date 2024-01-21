import { Scene } from 'phaser';
import { Player } from '../../classes/Player';
import { SlotContainer } from '@/classes/ui/SlotContainer';
import Sky from '@/classes/Sky';
import WorldMap from '@/classes/WorldMap';
import AlignGrid from '@/classes/utils/alignGrid';
import getColorFromValue from '@/helpers/get-color-from-value';
import Sun from '@/classes/Sun';
import Light from '@/classes/Light';
import Item, { ItemGameObject } from '@/classes/Item';

export class GameScene extends Scene {
    public worldMap!: WorldMap;
    public player!: Player;
    private background!: Sky;
    private sun!: Sun;

    raycasterPlugin!: PhaserRaycaster;

    constructor() {
        super('game-scene');
    }

    create(): void {
        const canvas = this.sys.game.canvas;

        //this.cameras.main.setZoom(2.5);
        this.cameras.main.setZoom(2.5);

        this.background = new Sky(this);
        this.worldMap = new WorldMap(this);

        this.player = new Player(this);
        this.physics.add.collider(this.player, this.worldMap.layers.ground);

        this.cameras.main.setBounds(
            0,
            0,
            this.worldMap.tilemap.widthInPixels,
            this.worldMap.tilemap.heightInPixels,
        );
        this.physics.world.setBounds(
            0,
            0,
            this.worldMap.tilemap.widthInPixels,
            this.worldMap.tilemap.widthInPixels,
        );

        this.cameras.main.startFollow(this.player, true);

        // this.marker = this.add.graphics();
        // this.marker.lineStyle(2, 0xffffff, 1);
        // this.marker.strokeRect(
        //     0,
        //     0,
        //     this.map.tileWidth * groundLayer!.scaleX,
        //     this.map.tileHeight * groundLayer!.scaleY,
        //);

        const tx = this.textures.createCanvas(
            'night-layer',
            this.worldMap.tilemap.widthInPixels,
            this.worldMap.tilemap.heightInPixels,
        );

        // tx?.context.globalCompositeOperation = 'destination-out';
        tx?.context.fillStyle = '#212245';
        tx?.context.fillRect(
            0,
            0,
            this.worldMap.tilemap.widthInPixels,
            this.worldMap.tilemap.heightInPixels,
        );

        tx?.refresh();
        //  this.add.image(0, 0, 'night-layer').setAlpha(0.5).setDepth(3000).setOrigin(0, 0);

        // const aGrid = new AlignGrid({ scene: this, rows: 12, cols: 12 });
        // aGrid.showNumbers();

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const pointerTileX = this.worldMap.tilemap.worldToTileX(pointer.worldX);
            const pointerTileY = this.worldMap.tilemap.worldToTileY(pointer.worldY);

            const tile = this.worldMap.tilemap.getTileAt(
                pointerTileX!,
                pointerTileY!,
                true,
                'main',
            );

            this.worldMap.layers.ground.putTileAt(-1, pointerTileX!, pointerTileY!);
            // this.worldMap.layers.ground.removeTileAt(pointerTileX!, pointerTileY!);
        });

        this.sun = new Sun(this, this.worldMap, this.worldMap.tilemap.widthInPixels / 2, 50);

        const graphicsOverlay = this.add.graphics();

        graphicsOverlay.fillGradientStyle(0x0, 0x0, 0x0, 0x0, 0, 0, 1, 1);
        graphicsOverlay.fillRect(0, 0, this.scale.width, this.scale.height);
        graphicsOverlay.setDepth(30000).setVisible(false);

        const drop = new ItemGameObject(this, new Item(0));
        this.physics.add.existing(drop);
        drop.setPosition(this.worldMap.tilemap.widthInPixels / 2, 200);
        this.physics.add.collider(drop, this.worldMap.layers.ground);
    }

    update(time: number, delta: number): void {
        this.player.update(time, delta);
        this.background.update(time, delta);
        this.sun.update();
        this.worldMap.update();

        // const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

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

        // this.marker.x = this.map.tileToWorldX(pointerTileX);
        // this.marker.y = this.map.tileToWorldY(pointerTileY);

        // this.marker.visible = false; //isNear;

        // this.clouds.tilePositionX -= 0.01;
        //this.cameras.main.setZoom(this.cameras.main.zoom + 0.0005);
    }
}
