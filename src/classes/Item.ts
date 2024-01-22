/* eslint-disable @typescript-eslint/no-namespace */

import { Scene } from 'phaser';

export default class Item {
    constructor(
        public id: number,
        public name: string,
        public texture: string | number = '',
        public stackable = true,
    ) {
        if (!texture) {
            this.texture = id;
        }
    }

    public getItem() {
        return this;
    }
}

export class Stack {
    constructor(public item: Item) {}

    public increase() {}
    public decrease() {}
    public getItem() {
        return this.item;
    }
}

export class Block extends Item {}

export class Tool extends Item {
    private health = 1;
}

export class ItemGameObject extends Phaser.GameObjects.Sprite {
    constructor(scene: Scene, private item: Item) {
        super(scene, 0, 0, 'items', 'golden_apple');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setDisplaySize(26, 26);
    }
}

export class ToolGameObject extends ItemGameObject {
    constructor(scene: Scene, item: Item) {
        super(scene, item);

        this.setTexture('items', 'diamond_pickaxe');
    }
}

export type ItemType = Item | Stack | null;

// export const createObjectFromType = (item: ItemType) => {};
