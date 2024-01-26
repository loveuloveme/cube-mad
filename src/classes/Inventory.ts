// export class Block extends Item {}
// export class Tool extends Item {}
import { Item } from './item/Item';
import Block from './item/Block';
import Stack from './item/Stack';
import Single from './item/Single';
import EventEmitter from 'events';
import { blocks, items } from '@/instances';

export default class Inventory extends EventEmitter {
    private inv: Item.Type[] | null[];
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

        this.inv[0] = new Single(items.getById(0));
        this.inv[1] = new Single(items.getById(1));
        this.inv[2] = new Stack(blocks.getById(1));
        // this.inv[1] = new Stack(blocks[0]);
        // this.inv[3] = items[2];
        // this.inv[4] = blocks[1];
        // this.inv[5] = blocks[2];
        // this.inv[6] = blocks[3];
    }

    public getStashItems(): typeof this.inv {
        return this.inv.slice(0, this.stashSize);
    }

    public getItems(): typeof this.inv {
        return this.inv;
    }

    public getSelect(): number {
        return this.select;
    }

    public getActive(): (typeof this.inv)[number] {
        return this.inv[this.select];
    }

    public setSelect(id: number): void {
        this.select = id;

        if (this.select < 0 || this.select >= this.inv.length) {
            this.select = 0;
        }

        this.emit('update');
    }

    private putForEmpty(item: Item.Type) {
        const i = this.getItems().findIndex((item) => item === null);
        if (i == -1) return false;

        this.inv[i] = item;

        return true;
    }

    public addItem(item: Item.Type): boolean {
        if (item instanceof Single) {
            return this.putForEmpty(item);
        }

        if (item instanceof Stack) {
            const req = item.getItem();

            for (const invItem of this.getItems().filter(Boolean)) {
                if (!(invItem instanceof Stack)) continue;

                const target = invItem.getItem();

                if (target.id === req.id) {
                    invItem.increase(item.getCount());

                    return true;
                }
            }

            return this.putForEmpty(item);
        }

        if (item instanceof Block) {
            for (const invItem of this.getItems().filter(Boolean)) {
                if (!(invItem instanceof Stack)) continue;

                const target = invItem.getItem();

                if (!(target instanceof Block)) continue;

                if (target.id === item.id) {
                    invItem.increase();

                    return true;
                }
            }

            return this.putForEmpty(new Stack(item, 1));
        }

        return false;
    }

    public update(): void {
        this.inv.forEach((item, i) => {
            if (item instanceof Stack) {
                if (item.getCount() === 0) {
                    this.inv[i] = null;
                }
            }
        });
    }
}
