import { GameScene } from '@/scenes';
import Item from './Item';

export default class Block extends Item {
    public mode: Item.Mode = Item.Mode.SPACE; // EMPTY

    public onInteract(scene: GameScene, time: number, delta: number, isInteracted: boolean): void {
        const { marker, player } = scene;

        if (marker.isHidden() || !isInteracted) {
            return;
        }

        const x = marker.x;
        const y = marker.y;

        scene.worldMap.layers.ground.putTileAtWorldXY(this.id, x, y);
        player.useAnimation();

        if (this.stack) {
            this.stack.onUse();
        }
    }
}
