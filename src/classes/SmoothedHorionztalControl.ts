export class SmoothedHorionztalControl {
    private msSpeed: number;
    private _value = 0;

    public get value(): number {
        return this._value;
    }
    public set value(value: number) {
        this._value = value;
    }

    constructor(speed: number) {
        this.msSpeed = speed;
        this.value = 0;
    }

    moveLeft(delta: number) {
        if (this.value > 0) {
            this.reset();
        }
        this.value -= this.msSpeed * delta;
        if (this.value < -1) {
            this.value = -1;
        }
    }

    moveRight(delta: number) {
        if (this.value < 0) {
            this.reset();
        }
        this.value += this.msSpeed * delta;
        if (this.value > 1) {
            this.value = 1;
        }
    }

    reset() {
        this.value = 0;
    }
}
