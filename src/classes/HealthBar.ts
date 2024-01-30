import { GameScene } from '@/scenes';

export default class HealthBar extends Phaser.GameObjects.Container {
    private hearts!: Phaser.GameObjects.Group;

    constructor(scene: GameScene, x: number, y: number, max: number) {
        super(scene);

        this.scene.add.existing(this);

        this.hearts = scene.add.group({ classType: Phaser.GameObjects.Image });

        this.hearts.createMultiple({
            key: 'heart',
            setXY: {
                x,
                y,
                stepX: 10,
            },
            quantity: max,
        });

        this.add(this.hearts.getChildren());
    }

    public setHealth(health: number): void {
        this.hearts.children.each((go, idx) => {
            const heart = go as Phaser.GameObjects.Image;
            heart.setTexture('heart', idx < health ? 0 : 1);

            return true;
        });
    }
}
