/* eslint-disable @typescript-eslint/no-namespace */

import Item, { ItemGameObject, ToolGameObject } from './Item';

export class Hero extends Phaser.GameObjects.Container {
    public head!: Phaser.GameObjects.Sprite;
    public tail!: Phaser.GameObjects.Sprite;
    public legs: Phaser.GameObjects.Sprite[] = new Array(2);
    public hands: Phaser.GameObjects.Sprite[] = new Array(2);

    activeItem!: ItemGameObject;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);

        this.initModel();
        this.setScale(2);
    }

    private initModel() {
        this.activeItem = new ToolGameObject(this.scene, new Item(0));
        (this.activeItem.body as Phaser.Physics.Arcade.Body).moves = false;

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

        // const c = this.scene.add.container(0, 0);
        // c.add([this.hands[1], this.activeItem]);

        this.add([
            ...this.legs,
            this.head,
            this.hands[0],
            this.tail,
            this.activeItem,
            this.hands[1],
        ]);

        //this.hands[0].setVisible(false);
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

    public update() {
        const isTool = this.activeItem instanceof ToolGameObject;
        this.activeItem.setScale(isTool ? 1 : 0.5);
        const offsetX = this.hands[1].width / 2 + (isTool ? 2 : 0);
        const offsetY = this.hands[1].height - this.activeItem.height / 2 + 6;

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
