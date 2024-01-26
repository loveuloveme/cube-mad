import { Tool } from '@/classes/item';

export default class IronPickaxe extends Tool {
    constructor() {
        super(0, 'Iron Pickaxe', 'iron_pickaxe');
    }
}

export const ironPickaxe = new IronPickaxe();
