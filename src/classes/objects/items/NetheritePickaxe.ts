import { Tool } from '@/classes/item';

export default class NetheritePickaxe extends Tool {
    constructor() {
        super(1, 'Netherite Pickaxe', 'netherite_pickaxe');
    }
}

export const netheritePickaxe = new NetheritePickaxe();
