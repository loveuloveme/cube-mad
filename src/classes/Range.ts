import { GameScene } from '@/scenes';
import { GameObjects } from 'phaser';

export default class Range extends Phaser.GameObjects.Group {
    constructor(scene: GameScene, private range = 75) {
        super(scene);

        this.add(
            this.scene.add.graphics().lineStyle(2, 0xffffff, 1).strokeCircle(0, 0, this.range),
        );

        this.add(this.scene.add.graphics().fillStyle(0xffffff, 0).fillCircle(0, 0, this.range));

        // this.add(
        //     this.scene.add
        //         .rectangle(0, 0, this.range - 1, 5, 0xffffff, 0.5)
        //         .setOrigin(0, 0.5)
        //         .setDepth(3000),
        // );

        // this.view.getChildren()[0].setDepth(3000);
    }

    public setPosition(x: number, y: number): void {
        this.getChildren().forEach((c) => (c as Phaser.GameObjects.Graphics).setPosition(x, y));
    }

    public setRange(range: number) {
        this.range = range;
    }

    public setPointer(size: number) {
        // const pointer = this.getChildren().at(-1)! as Phaser.GameObjects.Rectangle;
        // pointer.setDisplaySize(size, pointer.height);
    }

    public setAngle(angle: number) {
        // (this.getChildren().at(-1)! as Phaser.GameObjects.Graphics).setRotation(angle);
    }
}