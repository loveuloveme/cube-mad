// export class Block extends Item {}
// export class Tool extends Item {}

import { blocks, items } from '@/consts';
import Item, { ItemType, Stack } from './Item';
import EventEmitter from 'events';

export default class Inventory extends EventEmitter {
    private inv: ItemType[];
    private select = 0;

    constructor(size: number, public stashSize: number) {
        super();

        this.inv = new Proxy(new Array(size).fill(null), {
            set: (target, prop, val) => {
                target[prop] = val;

                this.emit('update');

                return true;
            },
        });

        this.inv[0] = items[0];
        this.inv[1] = new Stack(blocks[0]);
        this.inv[3] = items[2];
        this.inv[4] = blocks[1];
        this.inv[5] = blocks[2];
        this.inv[6] = blocks[3];
    }

    public getStashItems(): ItemType[] {
        return this.inv.slice(0, this.stashSize);
    }

    public getItems(): ItemType[] {
        return this.inv;
    }

    public getSelect(): number {
        return this.select;
    }

    public getActive(): ItemType {
        return this.inv[this.select];
    }

    public setSelect(id: number): void {
        this.select = id;

        if (this.select < 0 || this.select >= this.inv.length) {
            this.select = 0;
        }

        this.emit('update');
    }

    public update() {
        this.inv.forEach((item: ItemType, i) => {
            if (item instanceof Stack) {
                if (item.getCount() === 0) {
                    this.inv[i] = null;
                }
            }
        });
    }
}
