import { Scene } from 'phaser';

export default class Sky {
    public time = 0;

    private sky!: Phaser.GameObjects.TileSprite;
    private clouds!: Phaser.GameObjects.TileSprite;
    private mountains!: Phaser.GameObjects.TileSprite;
    private grass!: Phaser.GameObjects.TileSprite;

    private skyes!: Phaser.GameObjects.Group[];

    constructor(private scene: Scene) {
        const { width, height } = scene.scale;

        const createTileSprite = (key: string) => {
            return this.scene.add
                .tileSprite(
                    0,
                    height / 2 - this.scene.textures.get(key).getSourceImage().height / 2 + 50,
                    width,
                    this.scene.textures.get(key).getSourceImage().height,
                    key,
                )
                .setOrigin(0, 0.5)
                .setScrollFactor(0);
        };

        this.scene.add
            .graphics()
            .fillStyle(0x1a8961, 1)
            .fillRect(0, 0, width, height / 2)
            .setPosition(0, height / 2)
            .setScrollFactor(0);

        // createTileSprite('sky-3-bg'); // Ночь
        // createTileSprite('sky-1-bg'); //День
        // createTileSprite('sky-2-bg'); //Светает
        // createTileSprite('sky-4-bg'); //Светает 2 неровно
        // createTileSprite('sky-5-bg'); // Вечереет
        // createTileSprite('sky-6-bg'); // Вечереет ещё сильнее
        // createTileSprite('sky-7-bg'); // Закат или рассветт....

        const createSky = (id: number) => {
            const createImage = (key: string) => {
                const sk = createTileSprite(key);
                sk.setOrigin(0, 1);
                sk.setPosition(0, height / 2);
                sk.scale = sk.height / (height / 2);
                sk.width *= 1 / sk.scale;

                return sk;
            };

            return this.scene.add
                .group([
                    createImage(`sky-${id}-bg`),
                    createImage(`sky-${id}-clouds-bg`),
                    createImage(`sky-${id}-item`),
                    createImage(`sky-${id}-clouds`),
                ])
                .setAlpha(0);
        };

        this.skyes = [...Array(8).keys()].map((i) => createSky(i + 1));

        // createSky(5);

        this.sky = createTileSprite('sky');
        this.clouds = createTileSprite('clouds');
        this.mountains = createTileSprite('mountains');
        this.grass = createTileSprite('grass');

        // this.mountains.tint = 0xffc0cb;

        this.sky.setVisible(false);
        this.clouds.setVisible(false);
        // this.mountains.setVisible(false);
        // this.grass.setVisible(false);
        // this.mountains.y -= 20;
        this.clouds.y -= 10;
    }

    private show(skyGroup: Phaser.GameObjects.Group) {
        const sky = skyGroup.getChildren()[0] as Phaser.GameObjects.TileSprite;
        const clouds = skyGroup.getChildren()[1] as Phaser.GameObjects.TileSprite;
        const item = skyGroup.getChildren()[2] as Phaser.GameObjects.TileSprite;
        const cloudsBg = skyGroup.getChildren()[3] as Phaser.GameObjects.TileSprite;

        this.scene.tweens.add({
            targets: [sky],
            alpha: 1,
            duration: 3000,
            ease: 'Sine.inOut',
        });

        this.scene.tweens.add({
            targets: [clouds],
            y: {
                start: clouds.y + 10,
                to: clouds.y,
            },
            alpha: 1,
            duration: 1000,
            ease: 'Sine.inOut',
            delay: 2500,
        });

        this.scene.tweens.add({
            targets: [item],
            y: {
                start: item.y + 10,
                to: item.y,
            },
            alpha: 1,
            duration: 1000,
            ease: 'Sine.inOut',
            delay: 4500,
        });

        this.scene.tweens.add({
            targets: [cloudsBg],
            y: {
                start: cloudsBg.y + 10,
                to: cloudsBg.y,
            },
            alpha: 1,
            duration: 1000,
            ease: 'Sine.inOut',
            delay: 3500,
        });
    }

    private hide(skyGroup: Phaser.GameObjects.Group) {
        this.scene.tweens.add({
            targets: skyGroup.getChildren(),
            alpha: 0,
            duration: 3000,
            ease: 'Sine.inOut',
        });
    }

    private anims: [boolean, boolean][] = [];
    private prev = -1;

    private resetAnimsState() {
        this.anims = new Array(this.skyes.length).fill(0).map((_) => [false, false]);
    }

    public update(time: number, delta: number): void {
        if (this.time === 0 || this.anims.length === 0) {
            this.resetAnimsState();
        }

        const _add = (i: number) => {
            if (this.anims[i][0] == false) {
                this.anims[i][0] = true;

                if (this.prev > 0) {
                    this.anims[this.prev][1] = true;
                    this.hide(this.skyes[this.prev]);
                }

                this.show(this.skyes[i]);
            } else {
                this.prev = i;
            }
        };

        this.time += delta;

        // this.scene.cameras.main.setBackgroundColor('#588dbe');
        this.clouds.tilePositionX += 0.02;
        this.mountains.tilePositionX = this.scene.cameras.main.scrollX * 0.01;
        this.grass.tilePositionX = this.scene.cameras.main.scrollX * 0.05;

        const day = 500_000;

        if (this.time >= day) {
            this.time = 0;
        }

        const perDay = this.time / day;

        if (perDay > 0 && perDay < 0.3) {
            _add(2);
        }

        if (perDay > 0.3 && perDay < 0.5) {
            _add(1);
        }

        if (perDay > 0.5 && perDay < 0.6) {
            _add(3);
        }

        if (perDay > 0.6 && perDay < 0.8) {
            _add(0);
        }

        if (perDay > 0.8 && perDay < 0.9) {
            _add(4);
        }

        if (perDay > 0.9) {
            _add(6);
        }
    }
}
