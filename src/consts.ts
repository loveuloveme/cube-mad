import Item, { Block, Tool } from './classes/Item';

export const items = [
    new Tool(0, 'Iron Pickaxe', 'iron_pickaxe'),
    new Tool(1, 'Netherite Pickaxe', 'netherite_pickaxe'),
    new Item(2, 'Clock', 'clock_00'),
];

export const blocks = [
    new Block(0, 'Dirt'),
    new Block(1, 'Grass'),
    new Block(2, 'Stone'),
    new Block(3, 'Stone Block'),
];
