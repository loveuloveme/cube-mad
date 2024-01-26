import { Scene } from 'phaser';
import { Player } from '../../classes/Player';
import Sky from '@/classes/Sky';
import WorldMap from '@/classes/WorldMap';
import Sun from '@/classes/Sun';
import Marker from '@/classes/Marker';
import DropContainer from '@/classes/DropContainer';
import { Single, Stack } from '@/classes/item';
import { blocks, items } from '@/consts';

export class GameScene extends Scene {
    public worldMap!: WorldMap;
    public player!: Player;
    private background!: Sky;
    private sun!: Sun;
    public marker!: Marker;
    public dropContainer!: DropContainer;
    raycasterPlugin!: PhaserRaycaster;

    constructor() {
        super('game-scene');
    }

    create(): void {
        this.cameras.main.setZoom(2.5);

        this.background = new Sky(this);
        this.worldMap = new WorldMap(this);
        this.marker = new Marker(this);
        this.player = new Player(this);
        this.dropContainer = new DropContainer(this);

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
        this.sun = new Sun(this, this.worldMap, this.worldMap.tilemap.widthInPixels / 2, 50);

        const graphicsOverlay = this.add.graphics();

        graphicsOverlay.fillGradientStyle(0x0, 0x0, 0x0, 0x0, 0, 0, 1, 1);
        graphicsOverlay.fillRect(0, 0, this.scale.width, this.scale.height);
        graphicsOverlay.setDepth(30000).setVisible(false);

        this.dropContainer.createDrop(
            this.worldMap.tilemap.widthInPixels / 2 - 100,
            200,
            new Single(items[0]),
        );
        this.dropContainer.createDrop(
            this.worldMap.tilemap.widthInPixels / 2 + 100,
            200,
            new Stack(blocks[0]),
        );

        this.dropContainer.createDrop(
            this.worldMap.tilemap.widthInPixels / 2 + 200,
            200,
            new Stack(blocks[0]),
        );
        // const drop = new ToolGameObject(this, new Item(0));
        // this.physics.add.existing(drop);
        // drop.setPosition(this.worldMap.tilemap.widthInPixels / 2, 200);
        // this.physics.add.collider(drop, this.worldMap.layers.ground);

        // this.physics.add.overlap(
        //     this.player,
        //     this.dropContainer,
        //     (_, drop) => {
        //         console.log(drop);
        //     },
        //     undefined,
        //     this,
        // );
    }

    update(time: number, delta: number): void {
        this.player.update(time, delta);
        this.background.update(time, delta);
        this.sun.update();
        this.worldMap.update();
        this.marker.update();
        this.dropContainer.update();
    }
}
