import { Item, Tool } from '@/classes/item';
import Unit from '../Unit';

export default class Weapon extends Tool {
    mode = Item.Mode.IGNORE;
    public range = 50;

    public onInteract(context: Unit, time: number, delta: number): void {
        if (!context.isInteraction()) {
            return;
        }

        context.iPos = new Phaser.Math.Vector2(
            context.scene.input.activePointer.worldX,
            context.scene.input.activePointer.worldY,
        );

        context.attack();
    }
}
