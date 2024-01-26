import Hero from '@/classes/Hero';
import HeroAnimator from '@/classes/HeroAnimator';
import { SmoothedHorionztalControl } from './SmoothedHorionztalControl';
import Inventory from './Inventory';
import Light from './Light';
import { GameScene } from '@/scenes';
import Destroy from './Destroy';
import Range from './Range';
import Item from './item/Item';
import isInRange from '@/helpers/is-in-range';

export class Player extends Phaser.GameObjects.Container {
    private config = {
        movement: {
            speed: 400,
            jump: 400,
        },
        collider: {
            w: 25,
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
    public inventory: Inventory = new Inventory(20, 9);

    public dUnit: Destroy | null = null;

    private isInteraction = false;

    lastJumpedAt = 0;

    private range: Range;
    private rangeValue = 150;

    constructor(scene: GameScene) {
        super(scene, 700, 0);
        this.setSize(this.config.collider.w, this.config.collider.h);

        scene.physics.world.enable(this);
        (this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

        scene.add.existing(this);

        this.range = new Range(this.scene, this.rangeValue);
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

        if (this.inventory.getActive() === null) {
            marker.hide();
            return;
        }

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

        const markerX = scene.worldMap.tilemap.tileToWorldX(pointerTileX)!;
        const markerY = scene.worldMap.tilemap.tileToWorldY(pointerTileY)!;

        const isCrossX = isInRange(
            markerX,
            markerX + 32,
            this.x - this.displayWidth / 2 + 1,
            this.x + this.displayWidth / 2 - 1,
        );

        const isCrossY = isInRange(
            markerY,
            markerY + 32,
            this.y - this.displayHeight / 2 + 1,
            this.y + this.displayHeight / 2 - 1,
        );

        if (isCrossX && isCrossY) {
            marker.hide();
            return;
        }

        if (!!isSet && inRange) {
            marker.setPosition(markerX, markerY);
        } else {
            marker.hide();
        }
    }

    private setMovement(time: number, delta: number) {
        let oldVelocityX;
        let targetVelocityX;
        let newVelocityX;

        const body = this.body as Phaser.Physics.Arcade.Body;
        const scene = this.scene as GameScene;
        const marker = scene.marker;

        if (this.cursors.left.isDown || this.cursors.right.isDown) {
            const multiply = this.cursors.left.isDown ? -1 : 1;

            if (multiply < 0) {
                this.smoothedControls.moveLeft(delta);
            } else {
                this.smoothedControls.moveRight(delta);
            }

            if (!this.isInteraction) {
                //|| marker.isHidden()
                this.hero.scaleX = Math.abs(this.hero.scaleX) * multiply;
            }

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

        const canJump = time - this.lastJumpedAt > 750;

        if (this.cursors.up.isDown && canJump && body.onFloor()) {
            body.setVelocityY(-this.config.movement.jump);
            this.lastJumpedAt = time;
        }
    }

    public setInteraction(): void {
        const marker = this.scene.marker;
        if (this.isInteraction) {
            let angle = Phaser.Math.Angle.Between(this.x, this.y, marker.x + 16, marker.y + 16);

            if (this.hero.scaleX < 0) {
                angle = Math.abs(Math.abs(angle) - Math.PI) * Math.sign(angle);
            }

            if (!marker.isHidden()) {
                this.hero.setActiveHandAngle(angle - Math.PI / 2);
                if (Math.abs(marker.x + 16 - this.x) > 32) {
                    this.hero.scaleX =
                        Math.abs(this.hero.scaleX) * (marker.x + 16 > this.x ? 1 : -1);
                }
            }
        }

        if (!this.isInteraction || marker.isHidden()) {
            this.hero.setActiveHandAngle(0);
        }
    }

    public setAnimation(): void {
        const marker = this.scene.marker;

        const body = this.body as Phaser.Physics.Arcade.Body;

        if (Math.abs(body.velocity.x) > 0) {
            this.animator.setAnimation('run');
        } else {
            this.animator.setAnimation('idle');
        }

        if (this.isInteraction && !marker.isHidden()) {
            this.animator.setInteract();
        }
    }

    public useAnimation(): void {
        this.animator.createActivateAnimation();
    }

    update(time: number, delta: number): void {
        this.inventory.update();
        this.range.setVisible(this.isInteraction && this.inventory.getActive() !== null);

        this.setMarker();
        this.hero.update(time, delta);

        this.inventory
            .getActive()
            ?.getItem()
            .onInteract(this.scene, time, delta, this.isInteraction);

        this.hero.setItem(this.inventory.getActive()?.getItem() ?? null);
        this.setMovement(time, delta);
        this.setInteraction();
        this.setAnimation();
    }
}
