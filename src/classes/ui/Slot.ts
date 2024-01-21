import { Scene } from 'phaser';
import Item from '@/classes/Item';

export class Slot extends Phaser.GameObjects.Container {
    public item!: Item;
    public container!: Phaser.GameObjects.Container;
    private itemSprite!: Phaser.GameObjects.Sprite;

    public highlight!: Phaser.GameObjects.Graphics;

    private size = {
        w: 100,
        h: 100,
    };

    constructor(
        scene: Scene,
        x: number,
        y: number,
        w: number,
        h: number,
        public category: number | string,
    ) {
        super(scene, x, y);
        scene.add.existing(this);

        this.size = { w, h };

        this.item = new Item(0);
        // this.setSize(this.size.w, this.size.h);

        const hover = scene.add
            .graphics()
            .fillStyle(0xffffff, 0.1)
            .fillRect(0, 0, this.size.w, this.size.h)
            .setVisible(false);

        const highlight = scene.add
            .graphics()
            .fillStyle(0x50c878, 0.5)
            .fillRect(0, 0, this.size.w, this.size.h)
            .setVisible(false);

        this.highlight = highlight;

        this.container = scene.add
            .container(this.size.w / 2, this.size.h / 2)
            .setSize(this.size.w, this.size.h);

        const zone = scene.add
            .zone(this.size.w / 2, this.size.h / 2, this.size.w, this.size.h)
            .setRectangleDropZone(this.size.w, this.size.h);

        this.container.setInteractive();
        scene.input.setDraggable(this.container);
        this.setInteractive();

        this.itemSprite = scene.add.sprite(0, 0, 'block', this.item.id);
        this.itemSprite.setDisplaySize(this.size.w * 0.65, this.size.h * 0.65);
        this.container.add(this.itemSprite);

        // const sp = scene.add.sprite(0, 0, 'block', this.item.id).setDisplaySize(50, 50);

        // const maskSize = {
        //     w: sp.displayWidth * 0.1,
        //     h: sp.displayHeight * 0.1,
        // };

        // const pixelMask = scene.make
        //     .graphics()
        //     .fillStyle(0xffffff, 1)
        //     .fillRect(0, 0, maskSize.w, maskSize.h)
        //     .fillRect(sp.displayWidth - maskSize.w, 0, maskSize.w, maskSize.h)
        //     .fillRect(0, sp.displayHeight - maskSize.h, maskSize.w, maskSize.h)
        //     .fillRect(
        //         sp.displayWidth - maskSize.w,
        //         sp.displayHeight - maskSize.h,
        //         maskSize.w,
        //         maskSize.h,
        //     );

        // const mask = new Phaser.Display.Masks.BitmapMask(scene, pixelMask);
        // mask.invertAlpha = true;

        this.add([hover, zone, this.container, highlight]);
        this.setPosition(x, y);

        this.container.on('dragend', (pointer: Phaser.Input.Pointer) => {
            if (
                Math.abs(pointer.x - this.container.input!.dragStartXGlobal) < 2 &&
                Math.abs(pointer.y - this.container.input!.dragStartYGlobal) < 2
            ) {
                this.emit('click');
            }

            // if (!dropped) {
            this.container.x = this.container.input!.dragStartX;
            this.container.y = this.container.input!.dragStartY;
            // }
        });

        this.container.on(
            'dragover',
            (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
                if (gameObject !== zone) {
                    (gameObject.parentContainer as Slot).highlight.setVisible(true);
                }
            },
        );

        this.container.on(
            'dragleave',
            (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
                if (gameObject !== zone) {
                    (gameObject.parentContainer as Slot).highlight.setVisible(false);
                }
            },
        );

        this.container.on(
            'drop',
            (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
                (gameObject.parentContainer as Slot).highlight.setVisible(false);
            },
        );

        this.container.on('pointerover', (pointer: Phaser.Input.Pointer) => {
            hover.visible = true;
        });

        this.container.on('pointerout', () => {
            hover.visible = false;
        });

        this.container.on('drag', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
            this.parentContainer.bringToTop(this);
            this.container.x = x;
            this.container.y = y;
        });
    }

    public update(item: Item): void {
        this.item = item;

        this.container.input!.draggable = this.item.id !== 0;
        this.itemSprite.visible = this.item.id !== 0;
        this.itemSprite.setTexture('block', this.item.id);
    }
}
