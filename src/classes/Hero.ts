/* eslint-disable @typescript-eslint/no-namespace */

import { items } from '@/consts';
import Item, { Block, ItemGameObject, ItemType, Tool, ToolGameObject } from './Item';
import animatedValue from '@/helpers/animated-value';

export class Hero extends Phaser.GameObjects.Container {
    public head!: Phaser.GameObjects.Sprite;
    public tail!: Phaser.GameObjects.Sprite;
    public legs: Phaser.GameObjects.Sprite[] = new Array(2);
    public hands: Phaser.GameObjects.Sprite[] = new Array(2);

    activeItem!: Phaser.GameObjects.Sprite;
    private item: ItemType;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);

        this.initModel();
        this.setScale(2);
    }

    private initModel() {
        this.activeItem = this.scene.add.sprite(0, 0, 'items', 0);
        //ToolGameObject(this.scene, items[0])
        // (this.activeItem.body as Phaser.Physics.Arcade.Body).moves = false;

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

        this.hands = [0, 1].map((_) =>
            new Phaser.GameObjects.Sprite(
                this.scene,
                0,
                -this.tail.height / 2,
                'hero',
                'hand_left',
            ).setOrigin(0.5, 0),
        );

        this.head = new Phaser.GameObjects.Sprite(
            this.scene,
            0,
            -this.tail.height / 2,
            'hero',
            'head_left',
        ).setOrigin(0.5, 1);

        this.add([
            ...this.legs,
            this.head,
            this.hands[0],
            this.tail,
            this.activeItem,
            this.hands[1],
        ]);
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

    public setItem(item: ItemType) {
        this.item = item;
        // this.activeItem.setTexture
    }

    private handAngle: number = null;
    hash: any = null;

    public setActiveHandAngle(angle: number, hash: any) {
        if (this.handAngle !== angle) {
            this.scene.tweens.killTweensOf([this.hands[1]]);

            const isReset = hash === null;
            angle = angle ?? 0;
            angle = parseFloat(angle.toFixed(1));
            this.handAngle = angle;
            this.hash = hash;
            console.log(this.handAngle);

            this.scene.tweens.add({
                targets: [this.hands[1]],
                rotation: this.handAngle,
                duration: 200,
                onComplete: () => {
                    if (!isReset) {
                        this.scene.tweens.chain({
                            tweens: [
                                {
                                    targets: [this.hands[1]],
                                    duration: 100,
                                    rotation: '+=0.4',
                                },
                                {
                                    targets: [this.hands[1]],
                                    duration: 100,
                                    rotation: '-=0.4',
                                },
                            ],
                            repeat: -1,
                        });
                    }
                },
            });
        }
    }

    public update(time: number, delta: number) {
        const isTool = this.item instanceof Tool;
        this.activeItem.setVisible(!!this.item);

        // function lerp(start, end, t) {
        //     return start * (1 - t) + end * t;
        // }

        // if (this.handAngle != null) {
        //     this.hands[1].setRotation(lerp(this.hands[1].rotation, this.handAngle, delta / 1000));

        //     this.handAngle = null;
        // }

        if (this.item) {
            this.activeItem.setTexture(
                isTool || !(this.item.getItem() instanceof Block) ? 'items' : 'block',
                this.item.getItem().texture,
            );

            if (this.item.getItem() instanceof Tool) {
                this.activeItem.setDisplaySize(16, 16);
            } else {
                this.activeItem.setDisplaySize(6, 6);
            }

            const offsetX = this.hands[1].displayWidth / 2 + (isTool ? 0 : -1);
            const offsetY =
                this.hands[1].displayHeight - this.activeItem.displayHeight / 2 + (isTool ? 7 : 3);

            this.activeItem.setPosition(this.hands[1].x, this.hands[1].y + this.hands[1].height);

            this.activeItem.x =
                this.hands[1].x +
                offsetX * Math.cos(this.hands[1].rotation) -
                offsetY * Math.sin(this.hands[1].rotation);
            this.activeItem.y =
                this.hands[1].y +
                offsetX * Math.sin(this.hands[1].rotation) +
                offsetY * Math.cos(this.hands[1].rotation);

            this.activeItem.angle = 40 + this.hands[1].angle;
        }
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
