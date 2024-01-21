// export class Block extends Item {}
// export class Tool extends Item {}

import Item from './Item';

export default class Inventory {
    private inv: Item[];

    private _select = 0;

    public get select(): number {
        return this._select;
    }

    public set select(value: number) {
        this._select = value;
    }

    constructor(size: number) {
        this.inv = new Array(size).fill(0).map((_, i) => new Item(9 - i));
    }

    public getItems(): Item[] {
        return this.inv;
    }
}
