import Hero from './Hero';

export class HeroAnimator {
    private current: { tweens: Phaser.Tweens.TweenChain[]; name: Hero.State } | null = null;

    constructor(private hero: Hero) {}

    private idle() {
        this.hero.setHead(Hero.Head.FRONT);

        const tweens = [] as Phaser.Tweens.TweenChain[];

        tweens.push(
            this.hero.scene.tweens.chain({
                targets: [...this.hero.legs, ...this.hero.hands],
                tweens: [
                    { angle: { value: 0, duration: 0 } },
                    { angle: { value: 0, duration: 0 } },
                ],
                repeat: -1,
            }),
        );

        return tweens;
    }

    private jump() {
        this.hero.setHead(Hero.Head.SIDE);

        const tweens = [] as Phaser.Tweens.TweenChain[];

        const angle = 40;

        tweens.push(
            this.hero.scene.tweens.chain({
                targets: [this.hero.legs[0]], //targets: [this.hero.legs[0], this.hero.hands[1]],
                tweens: [{ angle: { value: angle, duration: 0 } }],
                repeat: -1,
            }),
        );

        tweens.push(
            this.hero.scene.tweens.chain({
                targets: [this.hero.legs[1], this.hero.hands[0]],
                tweens: [{ angle: { value: -angle, duration: 0 } }],
                repeat: -1,
            }),
        );

        return tweens;
    }

    private clear() {
        if (this.current) {
            this.current.tweens.forEach((tween) => {
                tween.destroy();
            });
        }
    }

    private interact() {
        this.hero.setHead(Hero.Head.SIDE);

        const tweens = [] as Phaser.Tweens.TweenChain[];

        const angle = 40;

        tweens.push(
            this.hero.scene.tweens.chain({
                targets: [this.hero.hands[1]],
                tweens: [{ angle: { value: angle, duration: 0 } }],
                repeat: -1,
            }),
        );

        tweens.push(
            this.hero.scene.tweens.chain({
                targets: [this.hero.hands[1]],
                tweens: [{ angle: { value: -angle, duration: 0 } }],
                repeat: -1,
            }),
        );

        return tweens;
    }

    private run() {
        this.hero.setHead(Hero.Head.SIDE);
        const angle = 40;
        const duration = 250;

        const tweens = [] as Phaser.Tweens.TweenChain[];

        tweens.push(
            this.hero.scene.tweens.chain({
                targets: this.hero.legs[0],
                tweens: [
                    { angle: { value: -angle, duration } },
                    { angle: { value: angle, duration } },
                ],
                repeat: -1,
            }),
        );

        tweens.push(
            this.hero.scene.tweens.chain({
                targets: this.hero.legs[1],
                tweens: [
                    { angle: { value: angle, duration } },
                    { angle: { value: -angle, duration } },
                ],
                repeat: -1,
            }),
        );

        tweens.push(
            this.hero.scene.tweens.chain({
                targets: this.hero.hands[0],
                tweens: [
                    { angle: { value: angle, duration } },
                    { angle: { value: -angle, duration } },
                ],
                repeat: -1,
            }),
        );

        // tweens.push(
        //     this.hero.scene.tweens.chain({
        //         targets: this.hero.hands[1],
        //         tweens: [
        //             { angle: { value: -angle, duration } },
        //             { angle: { value: angle, duration } },
        //         ],
        //         repeat: -1,
        //     }),
        // );

        return tweens;
    }

    public setAnimation(state: Hero.State): void {
        // if (this.current?.name === state) return;
        // this.clear();
        // switch (state) {
        //     case Hero.State.RUN:
        //         this.current = {
        //             tweens: this.run(),
        //             name: Hero.State.RUN,
        //         };
        //         break;
        //     case Hero.State.IDLE:
        //         this.current = {
        //             tweens: this.idle(),
        //             name: Hero.State.IDLE,
        //         };
        //         break;
        //     case Hero.State.JUMP:
        //         this.current = {
        //             tweens: this.jump(),
        //             name: Hero.State.JUMP,
        //         };
        //         break;
        //     // case ANIMS.IDLE:
        //     //     return this.idle;
        // }
    }
}

export default HeroAnimator;
