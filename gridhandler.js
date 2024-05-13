import { BLOCK_INTS } from './blocks.js';
import { HORIZON, LEVEL_HEIGHT, LEVEL_WIDTH } from './constants.js';
import RenderHandler from './renderhandler.js';

export default {
    init(game) {
        this.list = [];
        this.waterList = [];
        this.fireList = [];
        this.toggle = 0;
        for (var i = 0; i < LEVEL_WIDTH; i++) {
            this.list[i] = [];
            for (var j = 0; j < LEVEL_HEIGHT; j++) {
                this.list[i][j] = false;
            }
        }
        this.createLevel();
    },

    createLevel() {
        var flatness = 0.75;
        var list = this.list;
        var waterList = this.waterList;
        var height = HORIZON;
        var heights = [];

        for (let x = 0; x < LEVEL_WIDTH / 20; x++) {
            let randX = (Math.random() * (LEVEL_WIDTH - 20) + 10) | 0;
            let randY = (Math.random() * (LEVEL_HEIGHT * 0.5 - 20) + 8) | 0;
            for (let y = 0; y < 25; y++) {
                for (let k = 0; k < 9; k++) {
                    let X = (randX + Math.random() * k * 2 - k) | 0;
                    let Y = (randY + Math.random() * k - k / 2) | 0;
                    list[X][Y] = BLOCK_INTS.cloud;
                }
            }
        }

        for (let x = 0; x < LEVEL_WIDTH; x++) {
            if (x == 0 || x == LEVEL_WIDTH - 1) {
                for (let y = 0; y < LEVEL_HEIGHT; y++) {
                    list[x][y] = BLOCK_INTS.bedrock;
                }
                continue;
            }

            list[x][0] = BLOCK_INTS.bedrock;
            list[x][LEVEL_HEIGHT - 1] = BLOCK_INTS.bedrock;

            if (height > HORIZON) {
                for (let y = HORIZON; y < height; y++) {
                    list[x][y] = BLOCK_INTS.water;
                    waterList.push({ x, y });
                }
            }

            for (let y = height; y < LEVEL_HEIGHT - 1; y++) {
                if (y > height + Math.random() * 30 + 20) {
                    list[x][y] = BLOCK_INTS.iron;
                } else if (y > height + Math.random() * 8 + 4) {
                    list[x][y] = BLOCK_INTS.stone;
                } else {
                    list[x][y] = BLOCK_INTS.dirt;
                }
            }
            heights.push(height);
            if (Math.random() < flatness) {
                height += ((Math.random() * 3) | 0) - 1;
            }
            if (
                height > HORIZON &&
                x > LEVEL_WIDTH / 2 - 20 &&
                x < LEVEL_WIDTH / 2
            ) {
                height--;
            }
            if (height > LEVEL_HEIGHT - 1) {
                height--;
            } else if (height < 1) {
                height++;
            }
        }

        for (let x = 0; x < LEVEL_WIDTH / 25; x++) {
            let randX = (Math.random() * (LEVEL_WIDTH - 20) + 10) | 0;
            let randY =
                (HORIZON + Math.random() * (LEVEL_HEIGHT * 0.5 - 20) + 8) | 0;
            for (let y = 0; y < 25; y++) {
                for (let k = (Math.random() * 8) | 0; k >= 0; k--) {
                    let X = (randX + Math.random() * k * 2 - k) | 0;
                    let Y = (randY + Math.random() * k - k / 2) | 0;
                    list[X][Y] = false;
                }
            }
        }
        for (let x = 0; x < LEVEL_WIDTH / 25; x++) {
            var randX = (Math.random() * (LEVEL_WIDTH - 20) + 10) | 0;
            var randY =
                (HORIZON + Math.random() * (LEVEL_HEIGHT * 0.5 - 20) + 8) | 0;
            for (let y = 0; y < 25; y++) {
                for (let k = (Math.random() * 8) | 0; k >= 0; k--) {
                    let X = (randX + Math.random() * k * 2 - k) | 0;
                    let Y = (randY + Math.random() * k - k / 2) | 0;
                    list[X][Y] = BLOCK_INTS.water;
                    waterList.push({ x: X, y: Y });
                }
            }
        }

        for (let x = 0; x < LEVEL_WIDTH / 50; x++) {
            var randX = (Math.random() * (LEVEL_WIDTH - 20) + 20) | 0;
            var ground = heights[randX];
            var height = (Math.random() * 10 + 5) | 0;
            for (var i = 0; i < height; i++) {
                list[randX][ground - i] = BLOCK_INTS.wood;
            }
            let leafType = Math.round(Math.random() * 1);
            if (leafType == 0) leafType = BLOCK_INTS.leaves;
            else leafType = BLOCK_INTS.dark_leaves;

            let width = Math.round(Math.random() * 5) + 1;
            let center = ((width * 3) / 2) | 0;
            for (var j = 1; j <= width; j++) {
                var xrow = list[randX - center + j * 3];
                if (xrow != undefined && xrow != null)
                    xrow[ground - height] = leafType;
            }
        }
    },

    enterFrame() {
        var list = this.list;
        var toggle = this.toggle;
        for (var i = this.fireList.length - 1; i >= 0; i--) {
            var fire = this.fireList[i];
            if (fire.t > 10000) {
                list[fire.x][fire.y] = false;
                this.fireList.splice(i, 1);
                let lightIdx = RenderHandler.lights.findIndex(
                    (obj) => obj.x == fire.x && obj.y == fire.y
                );
                RenderHandler.lights.splice(lightIdx, 1);
            } else {
                fire.t++;
            }
            if (list[fire.x][fire.y + 1] == BLOCK_INTS.wood) {
                list[fire.x][fire.y + 1] = BLOCK_INTS.fire;
                this.fireList.push({ x: fire.x, y: fire.y + 1, t: 0 });
                RenderHandler.lights.push({ x: fire.x, y: fire.y + 1 });
            }
            if (list[fire.x + 1][fire.y] == BLOCK_INTS.wood) {
                list[fire.x + 1][fire.y] = BLOCK_INTS.fire;
                this.fireList.push({ x: fire.x + 1, y: fire.y, t: 0 });
                RenderHandler.lights.push({ x: fire.x + 1, y: fire.y });
            }
            if (list[fire.x - 1][fire.y] == BLOCK_INTS.wood) {
                list[fire.x - 1][fire.y] = BLOCK_INTS.fire;
                this.fireList.push({ x: fire.x - 1, y: fire.y, t: 0 });
                RenderHandler.lights.push({ x: fire.x - 1, y: fire.y });
            }
            if (list[fire.x][fire.y - 1] == BLOCK_INTS.wood) {
                list[fire.x][fire.y - 1] = BLOCK_INTS.fire;
                this.fireList.push({ x: fire.x, y: fire.y - 1, t: 0 });
                RenderHandler.lights.push({ x: fire.x, y: fire.y - 1 });
            }
        }
        for (var i = this.waterList.length - 1; i >= 0; i--) {
            toggle++;
            if (toggle > 9) {
                toggle = 0;
            }
            if (toggle != 0) {
                continue;
            }
            var water = this.waterList[i];
            if (list[water.x][water.y] != BLOCK_INTS.water) {
                this.waterList.splice(i, 1);
            }
            if (list[water.x][water.y + 1] === BLOCK_INTS.fire) {
                list[water.x][water.y + 1] = BLOCK_INTS.wood;
                let idx = this.fireList.findIndex(
                    (obj) => obj.x == water.x && obj.y == water.y + 1
                );
                this.fireList.splice(idx, 1);
            }
            if (list[water.x][water.y - 1] === BLOCK_INTS.fire) {
                list[water.x][water.y - 1] = BLOCK_INTS.wood;
                let idx = this.fireList.findIndex(
                    (obj) => obj.x == water.x && obj.y == water.y - 1
                );
                this.fireList.splice(idx, 1);
            }
            if (list[water.x - 1][water.y] === BLOCK_INTS.fire) {
                list[water.x - 1][water.y] = BLOCK_INTS.wood;
                let idx = this.fireList.findIndex(
                    (obj) => obj.x == water.x - 1 && obj.y == water.y
                );
                this.fireList.splice(idx, 1);
            }
            if (list[water.x + 1][water.y] === BLOCK_INTS.fire) {
                list[water.x + 1][water.y] = BLOCK_INTS.wood;
                let idx = this.fireList.findIndex(
                    (obj) => obj.x == water.x + 1 && obj.y == water.y
                );
                this.fireList.splice(idx, 1);
            }
            if (
                water.y < LEVEL_HEIGHT &&
                list[water.x][water.y + 1] === false
            ) {
                list[water.x][water.y + 1] = BLOCK_INTS.water;
                this.waterList[this.waterList.length] = {
                    x: water.x,
                    y: water.y + 1,
                };
            }
            if (
                water.y > LEVEL_HEIGHT / 2 &&
                list[water.x][water.y - 1] === false
            ) {
                list[water.x][water.y - 1] = BLOCK_INTS.water;
                this.waterList[this.waterList.length] = {
                    x: water.x,
                    y: water.y - 1,
                };
            }
            if (water.x > 0 && list[water.x - 1][water.y] === false) {
                list[water.x - 1][water.y] = BLOCK_INTS.water;
                this.waterList[this.waterList.length] = {
                    x: water.x - 1,
                    y: water.y,
                };
            }
            if (
                water.x < LEVEL_WIDTH - 1 &&
                list[water.x + 1][water.y] === false
            ) {
                list[water.x + 1][water.y] = BLOCK_INTS.water;
                this.waterList[this.waterList.length] = {
                    x: water.x + 1,
                    y: water.y,
                };
            }
        }
        this.toggle++;
        if (this.toggle > 9) {
            this.toggle = 0;
        }
    },
};
