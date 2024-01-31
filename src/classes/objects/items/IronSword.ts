import Unit from '@/classes/Unit';
import Weapon from '../../item/Weapon';

export default class IronSword extends Weapon {
    constructor() {
        super(2, 'Iron Sword', 'iron_sword');
    }

    public onInteract(context: Unit, time: number, delta: number): void {
        if (!context.isInteraction()) {
            return;
        }

        context.iPos = context.scene.input.activePointer.position;
        context.attack();
    }
}
