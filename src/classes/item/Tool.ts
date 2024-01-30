import Destroy from '../Destroy';
import Item from './Item';
import Unit from '../Unit';

export default class Tool extends Item {
    public onInteract(context: Unit, time: number, delta: number): void {
        if (!context.iPos || !context.isInteraction()) {
            context.destroyer?.destroy();
            context.destroyer = null;
            return;
        }

        const x = context.iPos.x;
        const y = context.iPos.y;

        const tile = context.scene.worldMap.layers.ground.getTileAtWorldXY(x, y);

        if (tile !== context.destroyer?.tile) {
            context.destroyer?.destroy();
            context.destroyer = null;

            context.destroyer = new Destroy(context.scene, tile);
        }

        if (context.destroyer?.active) {
            context.destroyer.setDepth(10000);
            context.destroyer.update(time, delta);
        }
    }
}
