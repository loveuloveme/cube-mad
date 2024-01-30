import Hero from '@/classes/Hero';
import HeroAnimator from '@/classes/HeroAnimator';
import { SmoothedHorionztalControl } from './SmoothedHorionztalControl';
import Inventory from './Inventory';
import { GameScene } from '@/scenes';
import Destroy from './Destroy';
import Range from './Range';
import Item from './item/Item';
import isInRange from '@/helpers/is-in-range';
import Unit from './Unit';

export class Player extends Unit {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    lastJumpedAt = 0;

    private range: Range;

    constructor(scene: GameScene) {
        super(scene);

        scene.add.existing(this);

        this.range = new Range(this.scene, this.iRadius);
        this.add(this.range.children.getArray());

        this.cursors = scene.input.keyboard!.createCursorKeys();

        scene.input.on('pointerdown', () => {
            this.setAction(Unit.Action.MOVE_LEFT);
        });
    }

    private setMarker(): void {
        const { x, y } = this.scene.input.activePointer.positionToCamera(
            this.scene.cameras.main,
        ) as Phaser.Math.Vector2;

        const scene = this.scene as GameScene;
        const marker = scene.marker;

        const pointerTileX = scene.worldMap.tilemap.worldToTileX(x)!;
        const pointerTileY = scene.worldMap.tilemap.worldToTileY(y)!;

        const nearest = [
            [-1, -1],
            [0, 1],
            [1, 1],
            [0, -1],
            [0, 0],
            [-1, 1],
            [1, -1],
            [-1, 0],
            [1, 0],
        ];

        const isSelf = !!scene.worldMap.tilemap.getTileAt(
            pointerTileX,
            pointerTileY,
            false,
            'main',
        );

        const isNear = nearest.some((near) =>
            scene.worldMap.tilemap.getTileAt(
                pointerTileX + near[0],
                pointerTileY + near[1],
                false,
                'main',
            ),
        );

        if (this.inventory.getActive() === null) {
            marker.hide();
            return;
        }

        const isSet = (() => {
            switch (this.inventory.getActive()?.getItem().mode) {
                case Item.Mode.CREATE:
                    if (!isNear) return;
                    break;
                case Item.Mode.SELECT:
                    if (!isSelf) return;
                    break;
                case Item.Mode.SPACE:
                    if (isSelf || !isNear) return;
                    break;
                case Item.Mode.IGNORE:
                    return;
            }

            return true;
        })();

        const inRange = Phaser.Math.Distance.Between(this.x, this.y, x, y) <= this.iRadius;

        const markerX = scene.worldMap.tilemap.tileToWorldX(pointerTileX)!;
        const markerY = scene.worldMap.tilemap.tileToWorldY(pointerTileY)!;

        const isCrossX = isInRange(
            markerX,
            markerX + 32,
            this.x - this.displayWidth / 2 + 1,
            this.x + this.displayWidth / 2 - 1,
        );

        const isCrossY = isInRange(
            markerY,
            markerY + 32,
            this.y - this.displayHeight / 2 + 1,
            this.y + this.displayHeight / 2 - 1,
        );

        if (isCrossX && isCrossY) {
            marker.hide();
            return;
        }

        if (!!isSet && inRange) {
            marker.setPosition(markerX, markerY);
        } else {
            marker.hide();
        }
    }

    private setControls(): void {
        this.toggleAction(Unit.Action.MOVE_LEFT, this.cursors.left.isDown);
        this.toggleAction(Unit.Action.MOVE_RIGHT, this.cursors.right.isDown);
        this.toggleAction(Unit.Action.MOVE_TOP, this.cursors.up.isDown);
        this.toggleAction(Unit.Action.INTERACTION, this.scene.input.activePointer.isDown);
    }

    update(time: number, delta: number): void {
        this.setMarker();
        this.setControls();

        const marker = this.scene.marker;

        if (!marker.isHidden()) {
            this.setInteractPos(marker.x, marker.y);
        } else {
            this.setInteractPos(null);
        }

        this.range.setVisible(this.scene.input.activePointer.isDown);

        super.update(time, delta);
    }
}
