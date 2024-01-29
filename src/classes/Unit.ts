/* eslint-disable @typescript-eslint/no-namespace */
import Hero from '@/classes/Hero';
import HeroAnimator from '@/classes/HeroAnimator';
import { SmoothedHorionztalControl } from './SmoothedHorionztalControl';
import Inventory from './Inventory';
import { GameScene } from '@/scenes';
import Destroy from './Destroy';
import Range from './Range';
import Item from './item/Item';
import isInRange from '@/helpers/is-in-range';

export class Unit extends Phaser.GameObjects.Container {
    private config: Unit.Config = {
        movement: {
            speed: 400,
            jump: 400,
        },
        collider: {
            w: 15,
            h: 64,
        },
    };

    private hero: Hero;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private smoothedControls: SmoothedHorionztalControl;
    private animator: HeroAnimator;
    public inventory!: Inventory;

    scene!: GameScene;

    private isInteraction = false;
    lastJumpedAt = 0;
    body!: Phaser.Physics.Arcade.Body;

    constructor(scene: GameScene, config?: Unit.Config) {
        super(scene, 700, 0);
        this.config = config ?? this.config;
        this.setSize(this.config.collider.w, this.config.collider.h);

        scene.physics.world.enable(this);
        this.body.setCollideWorldBounds(true);

        scene.add.existing(this);

        this.setDepth(3001);

        this.hero = new Hero(scene, 0, -4);
        this.animator = new HeroAnimator(this.hero);
        this.inventory = new Inventory(20, 9);

        this.add(this.hero);

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.smoothedControls = new SmoothedHorionztalControl(0.001);
    }

    private setMovement(time: number, delta: number) {
        let oldVelocityX;
        let targetVelocityX;
        let newVelocityX;

        const body = this.body as Phaser.Physics.Arcade.Body;

        const isMoving = this.actions.some(
            (v) => v === Unit.Action.MOVE_LEFT || v === Unit.Action.MOVE_RIGHT,
        );

        const isLeft = this.actions.some((v) => v === Unit.Action.MOVE_LEFT);
        const isJump = this.actions.some((v) => v === Unit.Action.MOVE_TOP);

        if (isMoving) {
            const multiply = isLeft ? -1 : 1;

            if (multiply < 0) {
                this.smoothedControls.moveLeft(delta);
            } else {
                this.smoothedControls.moveRight(delta);
            }

            if (!this.isInteraction) {
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

        if (isJump && canJump && body.onFloor()) {
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

    actions: Unit.Action[] = [Unit.Action.MOVE_TOP, Unit.Action.MOVE_LEFT];

    public setAction(action: Unit.Action) {
        this.actions.push(action);
    }

    update(time: number, delta: number): void {
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
    }

    export enum Action {
        MOVE_LEFT,
        MOVE_RIGHT,
        MOVE_TOP,
        MOVE_BOTTOM,
    }
}

export default Unit;
