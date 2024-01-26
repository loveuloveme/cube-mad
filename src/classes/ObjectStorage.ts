import { Item } from './item';

export default class ObjectStorage {
    constructor(private items: Item.RealType[]) {}

    public getByIndex(index: number): Item.RealType {
        return this.items[index];
    }

    public getById(id: number): Item.RealType {
        return this.items.find((item) => item.id === id)!;
    }
}
