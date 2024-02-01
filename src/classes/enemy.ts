import { GameScene } from '@/scenes';
import Unit from './Unit';
import IronSword from './objects/items/IronSword';
import { Single } from './item';

export default class Enemy extends Unit {
    target: Unit | null = null;

    constructor(scene: GameScene) {
        super(scene);

        this.inventory.setItem(0, new Single(new IronSword()));
    }

    private followTarget() {
        if (!this.target) return;
        if (!this.isAlive()) {
            return;
        }

        this.iPos = new Phaser.Math.Vector2(this.target.x, this.target.y);

        const delta = this.inventory.getActive().getItem().range;

        this.toggleAction(Unit.Action.MOVE_RIGHT, this.target.x > this.x);
        this.toggleAction(Unit.Action.MOVE_LEFT, this.target.x < this.x);

        if (Phaser.Math.Distance.Between(this.target.x, this.target.y, this.x, this.y) < delta) {
            // this.attack();
        }
    }

    update(time: number, delta: number): void {
        this.followTarget();
        super.update(time, delta);
    }
}
