import { Scene } from 'phaser';

export class LoadingScene extends Scene {
    constructor() {
        super('loading-scene');
    }

    preload(): void {
        this.load.baseURL = 'assets/';

        for (const skyIndex of new Array(8).fill(0).map((_, i) => i + 1)) {
            this.load.image(`sky-${skyIndex}-bg`, `sprites/background/${skyIndex}/1.png`);
            this.load.image(`sky-${skyIndex}-clouds-bg`, `sprites/background/${skyIndex}/2.png`);
            this.load.image(`sky-${skyIndex}-item`, `sprites/background/${skyIndex}/3.png`);
            this.load.image(`sky-${skyIndex}-clouds`, `sprites/background/${skyIndex}/4.png`);
        }

        this.load.image('sky', 'sprites/bg/sky.png');
        this.load.image('clouds', 'sprites/bg/clouds.png');
        this.load.image('mountains', 'sprites/bg/mountains.png');
        this.load.image('grass', 'sprites/bg/grass.png');
        this.load.image('grass-content', 'sprites/bg/grass-content.png');

        this.load.image('stash', 'sprites/ui/stash.png');
        this.load.image('stash-marker', 'sprites/ui/stash-marker.png');

        this.load.image('ground', 'sprites/platform.png');

        // PLAYER LOADING

        this.load.image('king', 'sprites/king.png');
        this.load.atlas('a-king', 'spritesheets/a-king.png', 'spritesheets/a-king_atlas.json');

        this.load.atlas('hero', 'spritesheets/hero.png', 'spritesheets/hero.json');
        this.load.atlas('items', 'spritesheets/items.png', 'spritesheets/items.json');

        // // MAP LOADING
        this.load.image({
            key: 'tiles',
            url: 'tilemaps/tiles/dungeon-16-16.png',
        });
        this.load.tilemapTiledJSON('dungeon', 'tilemaps/json/dungeon.json');

        this.load.image({
            key: 'blocks',
            url: 'tilemaps/tiles/tileset.png',
        });

        this.load.spritesheet('block', 'tilemaps/tiles/tileset.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.tilemapTiledJSON('map', 'tilemaps/json/map2.json');
    }

    create(): void {
        this.scene.start('game-scene');
        this.scene.start('ui-scene');
    }
}
