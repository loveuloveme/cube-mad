/* eslint-disable @typescript-eslint/no-namespace */

import { Scene } from 'phaser';

export default class Item {
    private _id: number;

    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }

    constructor(id: number) {
        this._id = id;
    }
}

export class ItemGameObject extends Phaser.GameObjects.Sprite {
    constructor(scene: Scene, private item: Item) {
        super(scene, 0, 0, 'items', 'golden_apple');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        // this.setDisplaySize
    }
}

export class ToolGameObject extends ItemGameObject {
    constructor(scene: Scene, item: Item) {
        super(scene, item);

        this.setTexture('items', 'diamond_pickaxe');
        // this.setDisplaySize(15, 15);
    }
}
