/* eslint-disable @typescript-eslint/no-namespace */

import { Scene } from 'phaser';
import Marker from './Marker';
import { GameScene } from '@/scenes';
import Destroy from './Destroy';

class Item {
    constructor(
        public id: number,
        public name: string,
        public texture: string | number = '',
        public mode: Item.Mode = Item.Mode.SELECT,
        public stackable = true,
    ) {
        if (!texture) {
            this.texture = id;
        }
    }

    public getItem() {
        return this;
    }

    public onInteract(scene: GameScene, time: number, delta: number, isInteracted: boolean) {}

    protected onUse?(): void;
}

export class Stack {
    private count = 5;
    constructor(public item: Block) {
        item.setStack(this);
    }

    public increase() {
        this.count += 1;
    }

    public decrease() {
        this.count -= 1;
    }

    public getItem() {
        return this.item;
    }

    public getCount() {
        return this.count;
    }

    onUse() {
        this.decrease();
    }
}

export class Block extends Item {
    public mode: Item.Mode = Item.Mode.SPACE; // EMPTY
    public stack?: Stack;

    public setStack(stack: Stack) {
        this.stack = stack;
    }

    public onInteract(scene: GameScene, time: number, delta: number, isInteracted: boolean): void {
        const { marker, player } = scene;

        if (marker.isHidden() || !isInteracted) {
            return;
        }

        const x = marker.x;
        const y = marker.y;

        scene.worldMap.layers.ground.putTileAtWorldXY(this.id, x, y);

        if (this.stack) {
            this.stack.onUse();
        }
    }
}

export class Tool extends Item {
    public onInteract(scene: GameScene, time: number, delta: number, isInteracted: boolean): void {
        const { marker, player } = scene;

        if (marker.isHidden() || !isInteracted) {
            player.dUnit?.destroy();
            player.dUnit = null;
            return;
        }

        const x = marker.x;
        const y = marker.y;

        const tile = scene.worldMap.layers.ground.getTileAtWorldXY(x, y);

        if (tile !== player.dUnit?.tile) {
            player.dUnit?.destroy();
            player.dUnit = null;

            player.dUnit = new Destroy(scene, tile);
        }

        if (player.dUnit?.active) {
            player.dUnit.setDepth(10000);
            player.dUnit.update(time, delta);
        }
    }
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

namespace Item {
    export enum Mode {
        CREATE,
        SELECT,
        IGNORE,
        SPACE,
    }

    export enum InteractMode {
        DESTROY,
        CREATE,
    }
}

export default Item;
