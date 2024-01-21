import { Scene } from 'phaser';
import { Slot } from './Slot';

export class SlotContainer extends Phaser.GameObjects.Container {
    public categories = new Map<string | number, Slot[]>();

    constructor(scene: Scene) {
        super(scene);

        scene.input.on(
            'drop',
            (
                pointer: Phaser.Input.Pointer,
                gameObject: Slot,
                dropZone: Phaser.GameObjects.Zone,
            ) => {
                const from = gameObject.parentContainer as Slot;
                const to = dropZone.parentContainer as Slot;

                if (from && to && from !== to) {
                    this.emit('update', { to: to.item, from: from.item });
                }
            },
        );
    }

    public extend(slot: Slot): void {
        this.add(slot);
        this.categories.set(slot.category, [...(this.categories.get(slot.category) ?? []), slot]);
    }

    public get(cat?: string | number): Slot[] {
        if (cat) {
            return this.categories.get(cat)!;
        }

        return this.getAll() as Slot[];
    }
}
