import { Scene } from 'phaser';
import WorldMap from './WorldMap';
import { GameScene } from '@/scenes';

export default class Sun extends Phaser.GameObjects.Zone {
    private ray!: Raycaster.Ray;
    private raycaster!: Raycaster;
    private worldMap!: WorldMap;

    constructor(scene: Scene, worldMap: WorldMap, x: number, y: number) {
        super(scene, x, y);
        this.worldMap = worldMap;

        this.raycaster = (scene as GameScene).raycasterPlugin.createRaycaster({
            debug: true,
        });

        this.raycaster.mapGameObjects(this.worldMap.layers.ground, true, {
            collisionTiles: [-1], //array of tile types which collide with rays
        });

        this.ray = this.raycaster.createRay();
    }

    private spread = 4;
    private dist = 0;
    private power = 1;

    public update() {
        this.ray.setOrigin(this.x, this.y);

        for (let angle = 0; angle < 360; angle += 1) {
            this.ray.setAngleDeg(angle);
            const point = this.ray.cast();

            if (point) {
                const tile = this.worldMap.layers.ground.getTileAtWorldXY(point.x, point.y);

                if (tile) {
                    this.worldMap.addLight(this.power, tile.x, tile.y);

                    try {
                        for (let i = 1; i <= this.dist + this.spread; i++) {
                            this.worldMap.addLight(
                                i < this.dist ? this.power : (this.power * 0.4) / (i - this.dist),
                                tile.x,
                                tile.y + i,
                            );
                        }
                    } catch (e) {}
                }
            }
        }
    }
}
