import WorldMap from './WorldMap';

export default class Light {
    private _radius = 2;
    private _shading = 2;

    private power = 0.5;

    public get radius() {
        return this._radius;
    }
    public set radius(value) {
        this._radius = value;
    }

    public get shading() {
        return this._shading;
    }
    public set shading(value) {
        this._shading = value;
    }

    constructor(
        private object: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container,
        private worldMap: WorldMap,
    ) {}

    public update() {
        this.worldMap.layers.ground.forEachTile((tile) => {
            const pos = this.worldMap.tilemap.worldToTileXY(this.object.x, this.object.y)!;

            const dist = Phaser.Math.Distance.Between(pos.x, pos.y, tile.x, tile.y);

            if (dist <= this.radius + this.shading) {
                this.worldMap.addLight(
                    Math.abs(
                        dist <= this.radius
                            ? this.power
                            : this.power - (this.power * (dist - this.radius)) / this.shading,
                    ),
                    tile.x,
                    tile.y,
                );
            }
        });
    }
}
