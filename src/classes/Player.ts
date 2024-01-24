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

    public dUnit: Destroy | null = null;

    private isInteraction = false;

    lastJumpedAt = 0;

    private range: Range;
    private rangeValue = 200;

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
        });

        // scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {});
    }

    private setMarker(): void {
        const { x, y } = this.scene.input.activePointer.positionToCamera(
            this.scene.cameras.main,
        ) as Phaser.Math.Vector2;

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
            [-1, 1],
            [1, -1],
            [-1, 0],
            [1, 0],
        ];

        const isSelf = !!scene.worldMap.tilemap.getTileAt(
            pointerTileX,
            pointerTileY,
            false,
            'main',
        );
        const isNear = nearest.some((near) =>
            scene.worldMap.tilemap.getTileAt(
                pointerTileX + near[0],
                pointerTileY + near[1],
                false,
                'main',
            ),
        );

        const isSet = (() => {
            switch (this.inventory.getActive()?.getItem().mode) {
                case Item.Mode.CREATE:
                    if (!isNear) return;
                    break;
                case Item.Mode.SELECT:
                    if (!isSelf) return;
                    break;
                case Item.Mode.SPACE:
                    if (isSelf || !isNear) return;
                    break;
                case Item.Mode.IGNORE:
                    return;
            }

            return true;
        })();

        const inRange = Phaser.Math.Distance.Between(this.x, this.y, x, y) <= this.rangeValue;

        if (!!isSet && inRange) {
            marker.setPosition(
                scene.worldMap.tilemap.tileToWorldX(pointerTileX)!,
                scene.worldMap.tilemap.tileToWorldY(pointerTileY)!,
            );
        } else {
            marker.hide();
        }
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

    interactLoop() {
        // if (this.isInteraction) {
        // }
    }

    update(time: number, delta: number): void {
        this.range.setAngle(this.ray.angle);
        this.range.setVisible(this.isInteraction);

        this.setMarker();
        this.setMovement(time, delta);
        this.hero.update();

        this.inventory
            .getActive()
            ?.getItem()
            .onInteract(this.scene, time, delta, this.isInteraction);

        this.hero.setItem(this.inventory.getActive()?.getItem());

        // this.smoothMoveCameraTowards(matterSprite, 0.9);

        if (this.isInteraction) {
        }
    }
}
