import Item from './Item';
import Unit from '../Unit';

export default class Block extends Item {
    public mode: Item.Mode = Item.Mode.SPACE; // EMPTY

    public onInteract(context: Unit, time: number, delta: number): void {
        if (!context.iPos || !context.isInteraction()) {
            return;
        }

        const x = context.iPos.x;
        const y = context.iPos.y;

        context.scene.worldMap.layers.ground.putTileAtWorldXY(this.id, x, y);
        context.useAnimation();

        if (this.stack) {
            this.stack.onUse();
        }
    }
}
