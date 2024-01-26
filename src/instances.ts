import ObjectStorage from './classes/ObjectStorage';
import { Block, Item } from './classes/item';

const requireAll = (requireContext: ReturnType<typeof require.context>) =>
    requireContext.keys().map(requireContext);

const classes = {
    blocks: requireAll(require.context('./classes/objects/blocks', true, /\.ts$/)),
    items: requireAll(require.context('./classes/objects/items', true, /\.ts$/)),
};

const createInstance = (objectClass) => {
    const ObjectClass = objectClass.default;
    const obj = new ObjectClass();
    return obj;
};

export const items = new ObjectStorage(classes.items.map(createInstance) as Item[]);
export const blocks = new ObjectStorage(classes.blocks.map(createInstance) as Block[]);
