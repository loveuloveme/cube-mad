import Hero from './Hero';

type HeroAnimation = 'run' | 'jump' | 'idle';

export class HeroAnimator {
    private current: { tweens: Phaser.Tweens.TweenChain[]; name: HeroAnimation } | null = null;

    constructor(private hero: Hero) {}

    private idle() {
        this.hero.setHead(Hero.Head.FRONT);

        const tweens = [] as Phaser.Tweens.TweenChain[];

        tweens.push(
            this.hero.scene.tweens.chain({
                targets: [...this.hero.legs, ...this.hero.hands.slice(0, 2)],
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
                targets: [this.hero.legs[0], this.hero.hands[1]],
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

        tweens.push(
            this.hero.scene.tweens.chain({
                targets: this.hero.hands[1],
                tweens: [
                    { angle: { value: -angle, duration } },
                    { angle: { value: angle, duration } },
                ],
                repeat: -1,
            }),
        );

        return tweens;
    }

    lastInteractTween: Phaser.Tweens.TweenChain | null = null;

    public createActivateAnimation() {
        this.hero.hands[2].rotation = -1;
    }

    public setInteract(): void {
        const hand = this.hero.hands[2];

        if (!this.lastInteractTween || this.lastInteractTween.isFinished()) {
            this.lastInteractTween = hand.createAnimation();
        }
        // if (isInteraction) {
        //     hand.createAnimation();
        // }
    }

    public setAnimation(name: HeroAnimation): void {
        if (this.current?.name === name) return;
        this.clear();
        let tweens = null;

        switch (name) {
            case 'run':
                tweens = this.run();
                break;
            case 'idle':
                tweens = this.idle();
                break;
            // case Hero.State.JUMP:
            //     this.current = {
            //         tweens: this.jump(),
            //         name: Hero.State.JUMP,
            //     };
            //     break;
            // case ANIMS.IDLE:
            //     return this.idle;
        }

        if (tweens) {
            this.current = {
                tweens,
                name,
            };
        }
    }
}

export default HeroAnimator;
