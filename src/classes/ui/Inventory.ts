import { Scene } from 'phaser';
import { SlotContainer } from './SlotContainer';
import { Slot } from './Slot';
import PlayerInventory from '../Inventory';
import Item from '../item/Item';
import { GameScene, UIScene } from '@/scenes';

const scale = 5;

export class Inventory extends Phaser.GameObjects.Container {
    private slotContainer!: SlotContainer;
    private stash!: Phaser.GameObjects.Sprite;
    private marker!: Phaser.GameObjects.Sprite;

    constructor(scene: Scene, private inventory: PlayerInventory) {
        super(scene);
        scene.add.existing(this);

        this.slotContainer = (this.scene.scene.get('ui-scene') as UIScene).slotContainer;

        this.marker = scene.add.sprite(0, 0, 'stash-marker').setOrigin(0, 0).setScale(scale);
        this.stash = scene.add.sprite(0, 0, 'stash');
        this.stash.setOrigin(0, 0).setScale(scale);

        this.inventory.getStashItems().forEach((it, i) => {
            const slot = new Slot(
                scene,
                3 * scale + (16 + 4) * scale * i,
                3 * scale,
                16 * scale,
                16 * scale,
                'inventory',
                i,
            );

            this.slotContainer.extend(slot);

            slot.on('click', () => {
                this.inventory.setSelect(i);
            });

            // slot.container.on('pointerup', () => {

            // });

            // slot.container.on('dragend', (pointer, object) => {
            //     if (
            //         pointer.x == object.input.dragStartXGlobal &&
            //         pointer.y == object.input.dragStartYGlobal
            //     ) {
            //         alert('Object clicked');
            //     }
            // });
        });

        this.slotContainer.on('update', (update: { to: Slot; from: Slot }) => {
            const items = this.inventory.getItems();

            const i = update.to.id as number;
            const j = update.from.id as number;

            items[j] = [items[i], (items[i] = items[j])][0];
        });

        this.add([this.stash, this.marker, this.slotContainer]);

        // this.setScale(5);
    }

    update() {
        const canvas = this.scene.sys.game.canvas;

        this.setPosition(
            canvas.width / 2 - this.stash.displayWidth / 2,
            canvas.height - this.stash.displayHeight - 10,
        );

        // this.slotContainer.update();

        const items = this.inventory.getItems();
        this.slotContainer.get('inventory').forEach((slot: Slot, i) => {
            slot.setItem(items[i]);
            slot.update();
        });

        // this.slotContainer.update();

        this.marker.setPosition(
            -1 * scale + (16 + 4) * scale * this.inventory.getSelect(),
            -1 * scale,
        );
    }
}
