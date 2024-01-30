/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-namespace */
import Stack from './Stack';
import Block from './Block';
import Single from './Single';
import Tool from './Tool';
import Unit from '../Unit';

export class Item {
    public stack?: Stack;

    constructor(
        public id: number,
        public name: string,
        public texture: string | number = '',
        public mode: Item.Mode = Item.Mode.SELECT,
        public stackable = true,
    ) {
        if (!texture) {
            this.texture = id - 1;
        }
    }

    public getItem(): Item {
        return this;
    }

    public setStack(stack: Stack): void {
        this.stack = stack;
    }

    public onInteract(context: Unit, time: number, delta: number): void {}

    protected onUse?(): void;
}

export namespace Item {
    export type Type = Item | Tool | Block | Stack | Single;
    export type RealType = Item | Tool | Block;

    export enum Mode {
        CREATE,
        SELECT,
        IGNORE,
        SPACE,
    }

    export enum InteractMode {
        DESTROY,
        CREATE,
    }
}

export default Item;
