import { BLOCK_INTS } from './blocks.js';
import { BLOCK_SIZE, LEVEL_HEIGHT, LEVEL_WIDTH } from './constants.js';
import GridHandler from './gridhandler.js';

export default {
    init(game) {
        this.size = 8;
        this.startHp = 30;
        this.list = [];
        this.pool = [];
    },

    enterFrame() {
        var gridList = GridHandler.list;
        var blood, X, Y;
        for (var i = this.list.length - 1; i >= 0; i--) {
            blood = this.list[i];
            blood.x += blood.vX;
            blood.y += blood.vY;
            blood.vY += 0.2;
            blood.hp--;
            X = (blood.x / BLOCK_SIZE) | 0;
            Y = (blood.y / BLOCK_SIZE) | 0;
            if (X >= 0 && X < LEVEL_WIDTH && Y >= 0 && Y < LEVEL_HEIGHT) {
                if (gridList[X][Y] == BLOCK_INTS.water) {
                    blood.x -= blood.vX * 0.5;
                    blood.y -= blood.vY * 0.5;
                } else if (
                    gridList[X][Y] !== false &&
                    gridList[X][Y] != BLOCK_INTS.cloud &&
                    gridList[X][Y] != BLOCK_INTS.platform
                ) {
                    blood.hp *= 0.75;
                }
            }
            if (blood.hp <= 0) {
                this.pool[this.pool.length] = blood;
                this.list.splice(i, 1);
                continue;
            }
        }
    },

    create(x, y, vX, vY, count) {
        for (var i = 0; i < count; i++) {
            var blood = {};
            if (this.pool.length > 0) {
                blood = this.pool.pop();
            }
            blood.x = x;
            blood.y = y;
            blood.vX = vX + Math.random() * 6 - 3;
            blood.vY = vY + Math.random() * 6 - 3;
            blood.hp = this.startHp;
            this.list[this.list.length] = blood;
        }
    },
};
