import { Block } from '@/classes/item';

export default class Dirt extends Block {
    constructor() {
        super(1, 'Dirt');
    }
}

export const dirt = new Dirt();
