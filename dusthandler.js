import { BLOCK_INTS } from './blocks.js';
import { BLOCK_SIZE, LEVEL_HEIGHT, LEVEL_WIDTH } from './constants.js';
import GridHandler from './gridhandler.js';

export default {
    init(game) {
        this.size = 6;
        this.startHp = 30;
        this.list = [];
        this.pool = [];
    },

    enterFrame() {
        var gridList = GridHandler.list;
        var dust, X, Y;
        for (var i = this.list.length - 1; i >= 0; i--) {
            dust = this.list[i];
            dust.x += dust.vX;
            dust.y += dust.vY;
            dust.vY += 0.2;
            dust.hp--;
            X = (dust.x / BLOCK_SIZE) | 0;
            Y = (dust.y / BLOCK_SIZE) | 0;
            if (X >= 0 && X < LEVEL_WIDTH && Y >= 0 && Y < LEVEL_HEIGHT) {
                if (gridList[X][Y] == BLOCK_INTS.water) {
                    dust.x -= dust.vX * 0.5;
                    dust.y -= dust.vY * 0.5;
                } else if (
                    gridList[X][Y] !== false &&
                    gridList[X][Y] != BLOCK_INTS.cloud &&
                    gridList[X][Y] != BLOCK_INTS.platform
                ) {
                    dust.hp *= 0.75;
                }
            }
            if (dust.hp <= 0) {
                this.pool[this.pool.length] = dust;
                this.list.splice(i, 1);
                continue;
            }
        }
    },

    create(x, y, vX, vY, count) {
        for (var i = 0; i < count; i++) {
            var dust = {};
            if (this.pool.length > 0) {
                dust = this.pool.pop();
            }
            dust.x = x;
            dust.y = y;
            dust.vX = vX + Math.random() * 6 - 3;
            dust.vY = vY + Math.random() * 6 - 3;
            dust.hp = this.startHp;
            this.list[this.list.length] = dust;
        }
    },
};
