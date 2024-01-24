import Item, { Block, Tool } from './classes/Item';

export const items = [
    new Tool(0, 'Iron Pickaxe', 'iron_pickaxe'),
    new Tool(1, 'Netherite Pickaxe', 'netherite_pickaxe'),
    new Item(2, 'Clock', 'clock_00'),
];

export const blocks = [
    new Block(1, 'Dirt'),
    new Block(2, 'Grass'),
    new Block(3, 'Stone'),
    new Block(4, 'Stone Block'),
];
