import { Input, Scene } from 'phaser';
import Hero from '@/classes/Hero';
import HeroAnimator from '@/classes/HeroAnimator';
import { SmoothedHorionztalControl } from './SmoothedHorionztalControl';
import Inventory from './Inventory';
import Light from './Light';
import { GameScene } from '@/scenes';
import Destroy from './Destroy';
import Range from './Range';
import Item from './Item';

export class Player extends Phaser.GameObjects.Container {
    private config = {
        movement: {
            speed: 400,
            jump: 400,
        },
        collider: {
            w: 32,
            h: 64,
        },
    };

    private hero: Hero;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private smoothedControls: SmoothedHorionztalControl;
    private animator: HeroAnimator;
    private lightning: Light;

    private ray!: Raycaster.Ray;
    private raycaster!: Raycaster;

    scene!: GameScene;
    public inventory: Inventory = new Inventory(20, 5);

    private dUnit: Destroy | null = null;

    private isInteraction = false;

    lastJumpedAt = 0;

    private range: Range;
    private rangeValue = 75;

    constructor(scene: GameScene) {
        super(scene, 700, 0);
        this.setSize(this.config.collider.w, this.config.collider.h);

        scene.physics.world.enable(this);
        (this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

        scene.add.existing(this);

        this.range = new Range(this.scene);
        this.setDepth(3001);
        this.add(this.range.children.getArray());

        const hero = new Hero(scene, 0, -5);
        this.add(hero);

        this.hero = hero;

        this.animator = new HeroAnimator(hero);

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.smoothedControls = new SmoothedHorionztalControl(0.001);

        this.raycaster = (scene as GameScene).raycasterPlugin.createRaycaster();

        this.raycaster.mapGameObjects(scene.worldMap.layers.ground, true, {
            collisionTiles: [-1],
        });

        this.ray = this.raycaster.createRay();
        this.ray.setDetectionRange(this.rangeValue);

        this.inventory.on('update', () => {
            this.hero.setItem(this.inventory.getActive());
        });

        scene.input.on('pointerdown', () => {
            this.isInteraction = true;
            this.range.setPointer(0);
        });

        scene.input.on('pointerup', () => {
            this.isInteraction = false;
            this.dUnit?.destroy();
        });

        // scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {});
    }

    private setMarker(): void {
        const { x, y } = this.scene.input.activePointer.positionToCamera(
            this.scene.cameras.main,
        ) as Phaser.Math.Vector2;

        switch (this.inventory.getActive()?.getItem().mode) {
            case Item.Mode.CREATE:
                const scene = this.scene as GameScene;
                const marker = scene.marker;

                const pointerTileX = scene.worldMap.tilemap.worldToTileX(x)!;
                const pointerTileY = scene.worldMap.tilemap.worldToTileY(y)!;

                const nearest = [
                    [-1, -1],
                    [0, 1],
                    [1, 1],
                    [0, -1],
                    [0, 0],
                ];

                const isNear = nearest.some((near) =>
                    scene.worldMap.tilemap.getTileAt(
                        pointerTileX + near[0],
                        pointerTileY + near[1],
                    ),
                );

                if (isNear) {
                    marker.setPosition(
                        scene.worldMap.tilemap.tileToWorldX(pointerTileX)!,
                        scene.worldMap.tilemap.tileToWorldY(pointerTileY)!,
                    );
                } else {
                    marker.hide();
                }
                break;
            case Item.Mode.DESTROY:
                const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
                this.ray.setAngle(angle);
                break;
        }
    }

    private setDestroy(time: number, delta: number) {
        const scene = this.scene as GameScene;
        const marker = scene.marker;

        if (this.dUnit) {
            marker.setPosition(this.dUnit.x, this.dUnit.y);
        } else {
            marker.hide();
        }

        if (!this.isInteraction) return;

        let pointerSize = this.rangeValue;

        this.ray.setOrigin(this.x, this.y);
        const point = this.ray.cast() as Point;

        let offsetY = 0;
        let offsetX = 0;

        if (this.ray.angle > Math.PI && this.ray.angle < Math.PI * 2) {
            offsetY -= 2;
        }

        if (this.ray.angle > Math.PI / 2 && this.ray.angle < Math.PI * 1.5) {
            offsetX -= 2;
        }

        const x = point.x + offsetX;
        const y = point.y + offsetY;

        const tile = this.scene.worldMap.layers.ground.getTileAtWorldXY(x, y);

        if (tile !== this.dUnit?.tile) {
            this.dUnit?.destroy();
            this.dUnit = null;

            if (tile && Phaser.Math.Distance.Between(this.x, this.y, x, y) < this.rangeValue) {
                this.dUnit = new Destroy(this.scene, tile);
            }
        }

        if (this.dUnit?.active) {
            pointerSize = Phaser.Math.Distance.Between(this.x, this.y, x, y);

            this.dUnit.setDepth(10000);
            this.dUnit.update(time, delta);
        }

        this.range.setPointer(pointerSize);
    }

    private setMovement(time: number, delta: number) {
        let oldVelocityX;
        let targetVelocityX;
        let newVelocityX;

        const body = this.body as Phaser.Physics.Arcade.Body;

        let animation = Hero.State.IDLE;

        if (this.cursors.left.isDown || this.cursors.right.isDown) {
            const multiply = this.cursors.left.isDown ? -1 : 1;

            if (multiply < 0) {
                this.smoothedControls.moveLeft(delta);
            } else {
                this.smoothedControls.moveRight(delta);
            }

            animation = Hero.State.RUN;
            this.hero.scaleX = Math.abs(this.hero.scaleX) * multiply;

            oldVelocityX = body.velocity.x;
            targetVelocityX = this.config.movement.speed * multiply;

            newVelocityX = Phaser.Math.Linear(
                oldVelocityX,
                targetVelocityX,
                this.smoothedControls.value * multiply,
            );

            body.setVelocityX(newVelocityX);
        } else {
            body.setVelocityX(0);
            this.smoothedControls.reset();
        }

        const canJump = time - this.lastJumpedAt > 250;

        if (this.cursors.up.isDown && canJump && body.onFloor()) {
            body.setVelocityY(-this.config.movement.jump);
            this.lastJumpedAt = time;
        }

        this.animator.setAnimation(animation);
    }

    update(time: number, delta: number): void {
        this.range.setAngle(this.ray.angle);
        this.range.setVisible(this.isInteraction);

        this.setMarker();
        this.setDestroy(time, delta);
        this.setMovement(time, delta);
        this.hero.update();

        this.hero.setItem(this.inventory.getActive()?.getItem());

        // this.smoothMoveCameraTowards(matterSprite, 0.9);

        if (this.isInteraction) {
        }
    }
}
