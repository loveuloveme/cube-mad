import { Input, Scene } from 'phaser';
import Hero from '@/classes/Hero';
import HeroAnimator from '@/classes/HeroAnimator';
import { SmoothedHorionztalControl } from './SmoothedHorionztalControl';
import Inventory from './Inventory';
import Light from './Light';
import { GameScene } from '@/scenes';
import Destroy from './Destroy';
import Range from './Range';

export class Player extends Phaser.GameObjects.Container {
    private hero: Hero;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private smoothedControls: SmoothedHorionztalControl;
    private animator: HeroAnimator;
    private lightning: Light;

    private ray!: Raycaster.Ray;
    private raycaster!: Raycaster;

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

        const hero = new Hero(scene, 0, -5);
        this.add(hero);

        this.hero = hero;

        this.animator = new HeroAnimator(hero);

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.smoothedControls = new SmoothedHorionztalControl(0.001);

        //this.lightning = new Light(this, (scene as GameScene).worldMap);

        // graphics.fillStyle(color, alpha);   // color: 0xRRGGBB

        this.range = new Range(this.scene);
        this.setDepth(3001);

        this.raycaster = (scene as GameScene).raycasterPlugin.createRaycaster({
            debug: true,
        });

        this.raycaster.mapGameObjects(scene.worldMap.layers.ground, true, {
            collisionTiles: [-1], //array of tile types which collide with rays
        });

        this.ray = this.raycaster.createRay();
        //enable arcade physics body
        this.ray.setDetectionRange(this.rangeValue);

        this.inventory.on('update', () => {
            this.hero.setItem(this.inventory.getActive());
        });

        scene.input.on('pointerdown', () => {
            this.isInteraction = true;
        });

        scene.input.on('pointerup', () => {
            this.isInteraction = false;
            this.dUnit?.destroy();
        });

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isInteraction) {
                const angle = Phaser.Math.Angle.Between(
                    this.x,
                    this.y,
                    pointer.worldX,
                    pointer.worldY,
                );
                this.ray.setAngle(angle);
            }
        });
    }

    update(time: number, delta: number): void {
        this.range.setPosition(this.x, this.y);
        this.range.setAngle(this.ray.angle);
        this.range.setVisible(this.isInteraction);

        if (this.isInteraction) {
            this.ray.setOrigin(this.x, this.y);
            const point = this.ray.cast() as Point;

            // Phaser.Math.Distance.Between(this.x, this.y, point.x, point.y)
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

            if (this.dUnit) {
                this.dUnit.setDepth(10000);
                this.dUnit.update(time, delta);
            }
        }

        this.hero.update();
        // this.lightning.update();

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

        this.hero.setItem(this.inventory.getActive()?.getItem());

        // this.smoothMoveCameraTowards(matterSprite, 0.9);

        if (this.isInteraction) {
        }
    }
}
