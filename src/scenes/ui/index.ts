import { Player } from '@/classes/Player';
import { Inventory } from '../../classes/ui/Inventory';
import { GameScene } from '../game';
import { SlotContainer } from '@/classes/ui/SlotContainer';

export class UIScene extends Phaser.Scene {
    public slotContainer!: SlotContainer;
    private inventory!: Inventory;
    private player!: Player;

    constructor() {
        super({ key: 'ui-scene' });
    }

    create() {
        this.slotContainer = new SlotContainer(this);

        this.player = (this.scene.get('game-scene') as GameScene).player;
        this.inventory = new Inventory(this, this.player.inventory);
    }

    update(time: number, delta: number): void {
        this.inventory.update();
    }
}
