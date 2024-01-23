import { GameScene } from '@/scenes';
import { GameObjects } from 'phaser';

export default class Range extends Phaser.GameObjects.Group {
    private view!: Phaser.GameObjects.Group;
    private pointer!: Phaser.GameObjects.Rectangle;
    range = 75;

    constructor(scene: GameScene) {
        super(scene);

        this.add(
            this.scene.add.graphics().lineStyle(2, 0xffffff, 1).strokeCircle(0, 0, this.range),
        );

        this.add(this.scene.add.graphics().fillStyle(0xffffff, 0.2).fillCircle(0, 0, this.range));

        this.add(
            this.scene.add
                .rectangle(0, 0, this.range - 1, 5, 0xffffff)
                .setOrigin(0, 0.5)
                .setDepth(3000),
        );

        // this.view.getChildren()[0].setDepth(3000);
    }

    public setPosition(x: number, y: number): void {
        this.getChildren().forEach((c) => (c as Phaser.GameObjects.Graphics).setPosition(x, y));
    }

    public setRange(range: number) {
        this.range = range;
    }

    public setAngle(angle: number) {
        (this.getChildren().at(-1)! as Phaser.GameObjects.Graphics).setRotation(angle);
    }
}
