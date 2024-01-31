import { GameScene } from '@/scenes';

export default class Range extends Phaser.GameObjects.Container {
    defaultRange = 200;
    constructor(scene: GameScene, private range = 75) {
        super(scene);

        this.generate();
    }

    private generate() {
        this.removeAll(true);

        this.add(
            this.scene.add.graphics().lineStyle(2, 0xffffff, 1).strokeCircle(0, 0, this.range),
        );
        this.add(this.scene.add.graphics().fillStyle(0xffffff, 0).fillCircle(0, 0, this.range));
    }

    public setRange(range: number): void {
        if (range !== this.range) {
            this.range = range;

            this.generate();
        }
    }
}
