import { Item } from './item';

export default class ObjectStorage {
    constructor(private items: Item.RealType[]) {}

    public getByIndex(index: number): Item.RealType {
        return this.items[index];
    }

    public getById(id: number): Item.RealType {
        const item = this.items.find((item) => item.id === id)!;

        if (!item) {
            throw new Error('No Item with id: ' + id);
        }

        return item;
    }
}
