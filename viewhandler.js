import { BLOCK_SIZE, LEVEL_HEIGHT, LEVEL_WIDTH } from './constants.js';
import PlayerHandler from './playerhandler.js';

export default {
    init(game) {
        this.x = LEVEL_WIDTH * BLOCK_SIZE * 0.5;
        this.y = 300;
        this.canvas = game.canvas;
    },
    enterFrame() {
        this.x += (PlayerHandler.x - this.x) * 0.05;
        if (this.x < PlayerHandler.x + 1 && this.x > PlayerHandler.x - 1) {
            this.x = PlayerHandler.x;
        }
        this.y += (PlayerHandler.y - this.y) * 0.05;
        if (this.y < PlayerHandler.y + 1 && this.y > PlayerHandler.y - 1) {
            this.y = PlayerHandler.y;
        }
        if (this.x < this.canvas.width * 0.5) {
            this.x = this.canvas.width * 0.5;
        } else if (
            this.x >
            LEVEL_WIDTH * BLOCK_SIZE - this.canvas.width * 0.5
        ) {
            this.x = LEVEL_WIDTH * BLOCK_SIZE - this.canvas.width * 0.5;
        }
        if (this.y < this.canvas.height * 0.5) {
            this.y = this.canvas.height * 0.5;
        } else if (
            this.y >
            LEVEL_HEIGHT * BLOCK_SIZE - this.canvas.height * 0.5
        ) {
            this.y = LEVEL_HEIGHT * BLOCK_SIZE - this.canvas.height * 0.5;
        }
    },
};
