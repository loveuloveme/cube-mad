/* eslint-disable @typescript-eslint/no-namespace */
import Item from './item/Item';
import Tool from './item/Tool';
import Block from './item/Block';
import { GameScene } from '@/scenes';
import Weapon from './item/Weapon';
import { Empty } from './item';

class HeroHand extends Phaser.GameObjects.Container {
    private wrapper!: Phaser.GameObjects.Container;
    public item!: Phaser.GameObjects.Sprite;
    private hand!: Phaser.GameObjects.Sprite;

    constructor(scene: GameScene) {
        super(scene);

        this.wrapper = this.scene.add.container(0, 0);

        this.hand = this.scene.add.sprite(0, 0, 'hero', 'hand').setOrigin(0.5, 0);
        this.item = this.scene.add.sprite(0, 0, 'items', 0).setVisible(false);
        this.item.setPosition(0, this.hand.displayHeight).setAngle(40);

        this.wrapper.add([this.item, this.hand]);
        this.add(this.wrapper);
    }

    public createAnimation() {
        this.scene.tweens.killTweensOf([this.wrapper]);

        return this.scene.tweens.chain({
            tweens: [
                {
                    targets: [this.wrapper],
                    duration: 100,
                    rotation: '+=0.4',
                },
                {
                    targets: [this.wrapper],
                    duration: 100,
                    rotation: '-=0.4',
                },
            ],
            repeat: 0,
        });
    }

    public setItem(_item: Item.Type) {
        const isTool = _item instanceof Tool;
        const isEmpty = _item instanceof Empty;

        this.item.setVisible(!isEmpty);
        if (isEmpty) return;

        this.item.setTexture(
            isTool || !(_item.getItem() instanceof Block) ? 'items' : 'blocks',
            _item.getItem().texture,
        );

        const offsetX = (isTool ? 5 : -1) + (_item instanceof Weapon ? 2 : 0);
        const offsetY = -this.item.displayHeight / 2 + (isTool ? 8 : 3);

        this.item.setPosition(offsetX, this.hand.displayHeight + offsetY);

        if (_item.getItem() instanceof Tool) {
            this.item.setDisplaySize(20, 20);
        } else {
            this.item.setDisplaySize(6, 6);
        }
    }
}

export class Hero extends Phaser.GameObjects.Container {
    public head!: Phaser.GameObjects.Sprite;
    public tail!: Phaser.GameObjects.Sprite;
    public legs: Phaser.GameObjects.Sprite[];
    public hands: HeroHand[];

    private item: Item.Type = new Empty();

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);

        this.tail = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'hero', 'body').setScale(
            0.9,
            1,
        );

        this.legs = [0, 1].map((_) =>
            new Phaser.GameObjects.Sprite(this.scene, 0, this.tail.height / 2, 'hero', 'leg')
                .setOrigin(0.5, 0)
                .setScale(0.9, 1),
        );

        this.hands = [0, 1, 2].map((_) => {
            const hand = new HeroHand(this.scene as GameScene);
            hand.setPosition(0, -this.tail.height / 2);

            hand.setScale(0.9, 1);
            return hand;
        });

        scene.physics.world.enable(this.hands[2].item);
        (this.hands[2].item.body as Phaser.Physics.Arcade.Body).moves = false;

        this.head = new Phaser.GameObjects.Sprite(
            this.scene,
            0,
            -this.tail.height / 2,
            'hero',
            'head',
        ).setOrigin(0.5, 1);

        this.add([...this.legs, this.hands[0], this.tail, this.hands[1], this.head, this.hands[2]]);

        this.setScale(1.76);
    }

    public setHead(type: Hero.Head): void {
        switch (type) {
            case Hero.Head.FRONT:
                this.head.setTexture('hero', 'head');
                break;
            case Hero.Head.SIDE:
                this.head.setTexture('hero', 'head');
        }
    }

    public setItem(item: Item.Type): void {
        this.item = item;
    }

    private handAngle = 0;

    public setActiveHandAngle(angle: number): void {
        const hand = this.hands[2];

        if (Math.abs(this.handAngle - angle) >= Math.PI / 100) {
            this.scene.tweens.killTweensOf([hand]);

            this.handAngle = angle;

            this.scene.tweens.add({
                targets: [hand],
                rotation: this.handAngle,
                duration: 200,
                repeat: 0,
            });
        }
    }

    attackAnim: Phaser.Tweens.TweenChain | null = null;

    public attack() {
        const hand = this.hands[2];

        if (!this.attackAnim || this.attackAnim.isFinished() || this.attackAnim.isDestroyed()) {
            this.scene.tweens.killTweensOf([hand]);
            hand.rotation = -2.5;

            this.attackAnim = this.scene.tweens.chain({
                targets: [hand],
                tweens: [
                    {
                        rotation: -2.5,
                        duration: 100,
                        repeat: 0,
                    },
                    {
                        rotation: 0,
                        duration: 200,
                        repeat: 0,
                    },
                    {
                        rotation: 0,
                        duration: 200,
                        repeat: 0,
                    },
                ],
            });
        }
    }

    public update(time: number, delta: number): void {
        [new Empty(), this.item, this.item].forEach((item, i) => this.hands[i].setItem(item));

        const isInAction = this.hands[2].rotation !== 0;

        this.hands[1].setVisible(isInAction ? false : true);
        this.hands[2].setVisible(isInAction ? true : false);
        this.hands[2].item.setActive(isInAction ? true : false);
    }
}

export namespace Hero {
    export enum State {
        IDLE,
        RUN,
        JUMP,
    }

    export enum Head {
        SIDE,
        FRONT,
    }
}

export default Hero;
