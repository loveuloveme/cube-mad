/* eslint-disable @typescript-eslint/no-namespace */
import Item from './item/Item';
import Tool from './item/Tool';
import Block from './item/Block';
import { GameScene } from '@/scenes';

class HeroHand extends Phaser.GameObjects.Container {
    private wrapper!: Phaser.GameObjects.Container;
    private item!: Phaser.GameObjects.Sprite;
    private hand!: Phaser.GameObjects.Sprite;

    constructor(scene: GameScene) {
        super(scene);

        this.wrapper = this.scene.add.container(0, 0);

        this.hand = this.scene.add.sprite(0, 0, 'hero', 'hand_left').setOrigin(0.5, 0);
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
        this.item.setVisible(!!_item);

        if (!_item) return;

        this.item.setTexture(
            isTool || !(_item.getItem() instanceof Block) ? 'items' : 'block',
            _item.getItem().texture,
        );

        const offsetX = isTool ? 2 : -1;
        const offsetY = -this.item.displayHeight / 2 + (isTool ? 7 : 3);

        this.item.setPosition(offsetX, this.hand.displayHeight + offsetY);

        if (_item.getItem() instanceof Tool) {
            this.item.setDisplaySize(16, 16);
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

    private item!: Item.Type;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);

        this.tail = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'hero', 'tail_left');

        this.legs = [0, 1].map((_) =>
            new Phaser.GameObjects.Sprite(
                this.scene,
                0,
                this.tail.height / 2,
                'hero',
                'leg_left',
            ).setOrigin(0.5, 0),
        );

        this.hands = [0, 1, 2].map((_) => {
            const hand = new HeroHand(this.scene as GameScene);
            hand.setPosition(0, -this.tail.height / 2);

            return hand;
        });

        this.head = new Phaser.GameObjects.Sprite(
            this.scene,
            0,
            -this.tail.height / 2,
            'hero',
            'head_left',
        ).setOrigin(0.5, 1);

        this.add([...this.legs, this.hands[0], this.tail, this.hands[1], this.head, this.hands[2]]);

        this.setScale(2);
    }

    public setHead(type: Hero.Head): void {
        switch (type) {
            case Hero.Head.FRONT:
                this.head.setTexture('hero', 'head_front');
                break;
            case Hero.Head.SIDE:
                this.head.setTexture('hero', 'head_left');
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

    public update(time: number, delta: number) {
        [null, this.item, this.item].forEach((item, i) => this.hands[i].setItem(item));

        const isInAction = this.hands[2].rotation !== 0;

        this.hands[1].setVisible(isInAction ? false : true);
        this.hands[2].setVisible(isInAction ? true : false);
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
