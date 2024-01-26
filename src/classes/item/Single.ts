import Item from './Item';

export default class Single {
    constructor(private item: Item.RealType) {}

    public getItem(): Item.RealType {
        return this.item;
    }
}
