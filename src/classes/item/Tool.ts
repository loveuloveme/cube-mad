import { GameScene } from '@/scenes';
import Destroy from '../Destroy';
import Item from './Item';

export default class Tool extends Item {
    public onInteract(scene: GameScene, time: number, delta: number, isInteracted: boolean): void {
        const { marker, player } = scene;

        if (marker.isHidden() || !isInteracted) {
            player.dUnit?.destroy();
            player.dUnit = null;
            return;
        }

        const x = marker.x;
        const y = marker.y;

        const tile = scene.worldMap.layers.ground.getTileAtWorldXY(x, y);

        if (tile !== player.dUnit?.tile) {
            player.dUnit?.destroy();
            player.dUnit = null;

            player.dUnit = new Destroy(scene, tile);
        }

        if (player.dUnit?.active) {
            player.dUnit.setDepth(10000);
            player.dUnit.update(time, delta);
        }
    }
}
