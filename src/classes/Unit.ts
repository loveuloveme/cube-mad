/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-namespace */
import Hero from '@/classes/Hero';
import HeroAnimator from '@/classes/HeroAnimator';
import { SmoothedHorionztalControl } from './SmoothedHorionztalControl';
import Inventory from './Inventory';
import { GameScene } from '@/scenes';
import Destroy from './Destroy';
import { blocks } from '@/instances';
import HealthBar from './HealthBar';
import { Item, Weapon } from './item';

export class Unit extends Phaser.GameObjects.Container {
    protected config: Unit.Config = {
        movement: {
            speed: 400,
            jump: 400,
        },
        collider: {
            w: 15,
            h: 64,
        },
        health: 2,
    };

    protected title: Phaser.GameObjects.Text;
    protected healthBar: HealthBar;
    public hero: Hero;
    protected smoothedControls: SmoothedHorionztalControl;
    protected animator: HeroAnimator;

    public inventory!: Inventory;
    public destroyer: Destroy | null = null;

    scene!: GameScene;
    lastJumpedAt = 0;
    body!: Phaser.Physics.Arcade.Body;

    public iPos: Phaser.Math.Vector2 | null = null;
    public name = '';

    private health: number;

    private flash;

    constructor(scene: GameScene, config?: Unit.Config) {
        super(scene, 700, 0);
        this.config = config ?? this.config;
        this.setSize(this.config.collider.w, this.config.collider.h);

        this.flash = this.scene.plugins.get('rexFlash')!.add(this, {
            duration: 500,
            repeat: 10,
        })!;

        scene.physics.world.enable(this);
        this.body.setCollideWorldBounds(true);

        scene.add.existing(this);

        this.setDepth(3001);

        this.health = this.config.health;

        this.hero = new Hero(scene, 0, -4);
        this.animator = new HeroAnimator(this.hero);
        this.inventory = new Inventory(20, 9);

        this.title = this.scene.add
            .text(0, -this.config.collider.h / 2 - 16, this.name, { fontFamily: 'HardPixel' })
            .setFontSize(8)
            .setOrigin(0.5)
            .setResolution(10);

        this.healthBar = new HealthBar(
            scene,
            0,
            -this.config.collider.h / 2 - 9,
            this.config.health,
        );

        this.healthBar.setX(-(this.healthBar.last as Phaser.GameObjects.Image).x / 2);

        this.add(this.hero);
        this.add(this.title);
        this.add(this.healthBar);

        this.smoothedControls = new SmoothedHorionztalControl(0.001);
        this.body.setDragX(1500);

        scene.physics.add.overlap(
            this.hero.hands[2].item,
            scene.units,
            (obj, target) => {
                if (
                    (obj as Phaser.GameObjects.GameObject).active &&
                    target !== this &&
                    target instanceof Unit &&
                    this.inventory.getActive().getItem() instanceof Weapon
                ) {
                    target.handleDamage(1, Math.sign(target.x - this.x));
                }
            },
            undefined,
            this,
        );
    }

    public isAlive(): boolean {
        return this.health > 0;
    }

    private setMovement(time: number, delta: number) {
        let oldVelocityX;
        let targetVelocityX;
        let newVelocityX;

        const body = this.body as Phaser.Physics.Arcade.Body;

        const isMoving = this.actions.some(
            (v) => v === Unit.Action.MOVE_LEFT || v === Unit.Action.MOVE_RIGHT,
        );

        const isLeft =
            this.actions
                .filter((v) => v === Unit.Action.MOVE_LEFT || v === Unit.Action.MOVE_RIGHT)
                .at(-1) === Unit.Action.MOVE_LEFT;
        const isJump = this.actions.some((v) => v === Unit.Action.MOVE_TOP);

        if (isMoving) {
            const multiply = isLeft ? -1 : 1;

            if (multiply < 0) {
                this.smoothedControls.moveLeft(delta);
            } else {
                this.smoothedControls.moveRight(delta);
            }

            if (!this.isInteraction()) {
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
            // body.setVelocityX(0);
            this.smoothedControls.reset();
        }

        const canJump = time - this.lastJumpedAt > 750;

        if (isJump && canJump && body.onFloor()) {
            body.setVelocityY(-this.config.movement.jump);
            this.lastJumpedAt = time;
        }
    }

    public setInteraction(): void {
        if (!this.isAlive()) return;

        const marker = this.iPos;

        if (this.isInteraction() && marker) {
            let angle = Phaser.Math.Angle.Between(this.x, this.y, marker.x + 16, marker.y + 16);

            if (this.hero.scaleX < 0) {
                angle = Math.abs(Math.abs(angle) - Math.PI) * Math.sign(angle);
            }

            if (this.inventory.getActive()?.getItem().mode !== Item.Mode.IGNORE) {
                this.hero.setActiveHandAngle(angle - Math.PI / 2);
            }

            // _)_
            if (Math.abs(marker.x + 16 - this.x) > 0) {
                this.hero.scaleX = Math.abs(this.hero.scaleX) * (marker.x + 16 > this.x ? 1 : -1);
            }
        }

        if (!this.isInteraction() || !marker) {
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

        if (this.isInteraction() && !marker.isHidden()) {
            this.animator.setInteract();
        }

        if (!this.isAlive()) {
            this.animator.setAnimation('run');
        }
    }

    public useAnimation(): void {
        this.animator.createActivateAnimation();
    }

    actions: Unit.Action[] = [];

    public setAction(action: Unit.Action): void {
        if (this.actions.findIndex((v) => v === action) === -1) {
            this.actions.push(action);
        }
    }

    public removeAction(action: Unit.Action): void {
        this.actions = this.actions.filter((v) => v !== action);
    }

    public toggleAction(action: Unit.Action, isAdd: boolean): void {
        if (isAdd) {
            this.setAction(action);
        } else {
            this.removeAction(action);
        }
    }

    public isInteraction(): boolean {
        return this.actions.some((v) => v === Unit.Action.INTERACTION);
    }

    public setInteractPos(x: number | null, y?: number): void {
        if (x === null) {
            this.iPos = null;
            return;
        }

        if (y) {
            this.iPos = this.isInRadius(x, y) ? new Phaser.Math.Vector2(x, y) : null;
        }
    }

    public isInRadius(x: number, y: number): boolean {
        return (
            Phaser.Math.Distance.Between(this.x, this.y, x, y) <=
            this.inventory.getActive().getItem().range
        );
    }

    public setDestroy(): void {
        if (this.destroyer?.isDone()) {
            const { tile } = this.destroyer;

            const drop = this.scene.dropContainer.createDrop(
                tile.pixelX + tile.width / 2,
                tile.pixelY + tile.height / 2,
                blocks.getById(tile.index),
            );

            tile.tilemapLayer?.putTileAt(-1, tile.x, tile.y);

            const body = drop.body as Phaser.Physics.Arcade.Body;
            Phaser.Math.RandomXY(body.velocity, 50);
            body.setDrag(100);
        }
    }

    lastDamage = 0;
    time = 0;

    public handleDamage(damage: number, dir: number): void {
        if (this.time - this.lastDamage < 1000) {
            return;
        }

        this.health -= damage;

        if (this.health <= 0) {
            this.health = 0;

            this.body.moves = false;

            this.scene.tweens.chain({
                targets: [this],
                tweens: [
                    {
                        y: '-=10',
                        opacity: 0,
                        duration: 200,
                    },
                    {
                        y: '+=500',
                        duration: 400,
                        onComplete: () => {
                            // this.destroy();
                        },
                    },
                ],
            });
        }

        this.lastDamage = this.time;
        this.body.setVelocityX(500 * dir);

        // this.flash.flash();
    }

    public attack(): void {
        this.hero.attack();
    }

    update(time: number, delta: number): void {
        this.time = time;
        this.hero.update(time, delta);

        this.inventory.getActive()?.getItem().onInteract(this, time, delta);
        this.hero.setItem(this.inventory.getActive()?.getItem() ?? null);
        this.setDestroy();
        this.setMovement(time, delta);
        this.setInteraction();
        this.setAnimation();
        this.inventory.update();

        this.title.setText(this.name);
        this.healthBar.setHealth(this.health);
    }
}

export namespace Unit {
    export interface Config {
        movement: {
            speed: number;
            jump: number;
        };

        collider: {
            w: number;
            h: number;
        };

        health: number;
    }

    export enum Action {
        MOVE_LEFT,
        MOVE_RIGHT,
        MOVE_TOP,
        MOVE_BOTTOM,
        INTERACTION,
    }
}

export default Unit;
