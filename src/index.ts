import { Game, Scale, Types, WEBGL } from 'phaser';
import { GameScene, LoadingScene, UIScene } from './scenes';
import PhaserRaycaster from 'phaser-raycaster';
import FlashPlugin from 'phaser3-rex-plugins/plugins/flash-plugin.js';

type GameConfigExtended = Types.Core.GameConfig & {
    winScore: number;
};

export const gameConfig: GameConfigExtended = {
    title: 'Phaser game tutorial',
    type: WEBGL,
    parent: 'game',
    // backgroundColor: '#351f1b',
    scale: {
        mode: Scale.ScaleModes.NONE,
        width: window.innerWidth,
        height: window.innerHeight,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1300 },
            //debug: true,
        },
    },
    render: {
        antialiasGL: false,
        pixelArt: true,
    },
    callbacks: {
        postBoot: () => {
            window.sizeChanged();
        },
    },
    canvasStyle: `display: block; width: 100%; height: 100%;`,
    autoFocus: true,
    audio: {
        disableWebAudio: false,
    },
    scene: [LoadingScene, GameScene, UIScene],
    plugins: {
        scene: [
            {
                key: 'PhaserRaycaster',
                plugin: PhaserRaycaster,
                mapping: 'raycasterPlugin',
            },
        ],
        global: [
            {
                key: 'rexFlash',
                plugin: FlashPlugin,
                start: true,
            },
        ],
    },
    winScore: 40,
};

window.sizeChanged = () => {
    if (window.game.isBooted) {
        setTimeout(() => {
            window.game.scale.resize(window.innerWidth, window.innerHeight);

            window.game.canvas.setAttribute(
                'style',
                `display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`,
            );
        }, 100);
    }
};

window.onresize = () => window.sizeChanged();

window.game = new Game(gameConfig);
