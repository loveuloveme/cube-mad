import { Item } from '.';

export default class Stack {
    constructor(public item: Item.RealType, private count = 5) {
        this.item = Object.assign(Object.create(Object.getPrototypeOf(item)), item);

        this.item.setStack(this);
    }

    public increase(count?: number): void {
        this.count += count ?? 1;
    }

    public decrease(count?: number): void {
        this.count -= count ?? 1;
    }

    public getItem(): Item.RealType {
        return this.item;
    }

    public getCount(): number {
        return this.count;
    }

    onUse(): void {
        this.decrease();
    }
}
