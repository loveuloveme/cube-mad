import { Input, Scene } from 'phaser';
import Hero from '@/classes/Hero';
import HeroAnimator from '@/classes/HeroAnimator';
import { SmoothedHorionztalControl } from './SmoothedHorionztalControl';
import Inventory from './Inventory';
import Light from './Light';
import { GameScene } from '@/scenes';

export class Player extends Phaser.GameObjects.Container {
    private hero: Hero;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private smoothedControls: SmoothedHorionztalControl;
    private animator: HeroAnimator;
    private lightning: Light;

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

    public inventory: Inventory = new Inventory(9);

    constructor(scene: Scene) {
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

        this.lightning = new Light(this, (scene as GameScene).worldMap);
    }

    lastJumpedAt = 0;

    update(time: number, delta: number): void {
        this.hero.update();
        this.lightning.update();

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

        // this.smoothMoveCameraTowards(matterSprite, 0.9);
    }
}
