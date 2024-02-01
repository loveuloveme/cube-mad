import { Scene } from 'phaser';
import { Player } from '../../classes/Player';
import Sky from '@/classes/Sky';
import WorldMap from '@/classes/WorldMap';
import Sun from '@/classes/Sun';
import Marker from '@/classes/Marker';
import DropContainer from '@/classes/DropContainer';
import { Single, Stack } from '@/classes/item';
import { blocks, items } from '@/instances';
import Enemy from '@/classes/Enemy';

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

        this.units = this.add.group();
        this.background = new Sky(this);
        this.worldMap = new WorldMap(this);
        this.marker = new Marker(this);
        this.player = new Player(this);
        this.dropContainer = new DropContainer(this);

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
            new Single(items.getById(0)),
        );
        this.dropContainer.createDrop(
            this.worldMap.tilemap.widthInPixels / 2 + 100,
            200,
            new Stack(blocks.getById(180)),
        );

        this.dropContainer.createDrop(
            this.worldMap.tilemap.widthInPixels / 2 + 200,
            200,
            new Stack(blocks.getById(180)),
        );

        // this.lights.enable();
        // //set ambient colour whole scene. This is set to quite dark for contrast with lights
        // this.lights.setAmbientColor(0x000000);

        // //light at entrance to level
        // this.l = this.lights
        //     .addLight(this.player.x, this.player.y, 150)
        //     .setColor(0xffffff)
        //     .setIntensity(0.5);

        // this.worldMap.layers.ground.setPipeline('Light2D');
        // this.worldMap.layers.background.setPipeline('Light2D');

        this.enemy = new Enemy(this);
        this.enemy.name = 'Зомби';

        this.enemy.target = this.player;

        this.units.add(this.player);
        this.units.add(this.enemy);

        // this.physics.add.collider(this.units, this.units);
        this.physics.add.collider(this.units, this.worldMap.layers.ground);
    }

    units!: Phaser.GameObjects.Group;

    update(time: number, delta: number): void {
        this.player.update(time, delta);
        this.background.update(time, delta);
        this.sun.update();
        this.worldMap.update();
        this.marker.update();
        this.dropContainer.update();
        this.enemy.update(time, delta);

        // this.l.setPosition(this.player.x, this.player.y);
    }
}
