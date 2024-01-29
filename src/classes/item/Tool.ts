import Destroy from '../Destroy';
import Item from './Item';
import Unit from '../Unit';

export default class Tool extends Item {
    public onInteract(context: Unit, time: number, delta: number): void {
        if (!context.iPos || !context.isInteraction()) {
            context.dUnit?.destroy();
            context.dUnit = null;
            return;
        }

        const x = context.iPos.x;
        const y = context.iPos.y;

        const tile = context.scene.worldMap.layers.ground.getTileAtWorldXY(x, y);

        if (tile !== context.dUnit?.tile) {
            context.dUnit?.destroy();
            context.dUnit = null;

            context.dUnit = new Destroy(context.scene, tile);
        }

        if (context.dUnit?.active) {
            context.dUnit.setDepth(10000);
            context.dUnit.update(time, delta);
        }
    }
}
