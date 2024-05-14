import { BLOCK_INTS } from './blocks.js';
import {
    BASE_AMPLITUDE,
    BASE_WAVELENGTH,
    CAVE_HORIZON_RATIO,
    CAVE_PERLIN_CUTOFF,
    CLOUD_HORIZON_RATIO,
    CLOUD_PERLIN_CUTOFF,
    HORIZON,
    ISLAND_HORIZON_RATIO,
    ISLAND_PERLIN_CUTOFF,
    LEVEL_HEIGHT,
    LEVEL_OCTAVES,
    LEVEL_WIDTH,
    TREE_CHANCE,
} from './constants.js';
import { perlin1d } from './perlin.js';
import RenderHandler from './RenderHandler.js';

function addArray(a, b) {
    return a.map((e, i) => Math.round(e + b[i]));
}

export default {
    init(game) {
        this.list = [];
        this.waterList = [];
        this.fireList = [];
        this.toggle = 0;

        this.createLevel();
    },

    createLevel() {
        let simplex = new SimplexNoise();
        this.heightmap = perlin1d(LEVEL_WIDTH, BASE_AMPLITUDE, BASE_WAVELENGTH);
        for (let octave = 1; octave <= LEVEL_OCTAVES; octave++) {
            this.heightmap = addArray(
                this.heightmap,
                perlin1d(
                    LEVEL_WIDTH,
                    BASE_AMPLITUDE / Math.pow(2, octave),
                    BASE_WAVELENGTH / Math.pow(2, octave)
                )
            );
        }
        let rocknoise = perlin1d(
            LEVEL_WIDTH,
            BASE_AMPLITUDE / 2,
            BASE_WAVELENGTH
        );

        // Apply heightmap, rock noise, and 2d simplex noise to create terrain
        for (let i = 0; i < LEVEL_WIDTH; i++) {
            this.list[i] = [];
            for (let j = 0; j < LEVEL_HEIGHT; j++) {
                if (
                    i == 0 ||
                    j == 0 ||
                    i == LEVEL_WIDTH - 1 ||
                    j == LEVEL_HEIGHT - 1
                ) {
                    this.list[i][j] = BLOCK_INTS.bedrock;
                    continue;
                }

                if (j > LEVEL_HEIGHT - rocknoise[i]) {
                    this.list[i][j] = BLOCK_INTS.stone;
                } else if (j > LEVEL_HEIGHT - this.heightmap[i]) {
                    this.list[i][j] = BLOCK_INTS.dirt;
                } else if (j >= HORIZON) {
                    this.list[i][j] = BLOCK_INTS.water;
                    this.waterList.push({ x: i, y: j });
                } else {
                    this.list[i][j] = false;
                }
                let overlay = simplex.noise2D(i * 0.03, j * 0.03);
                if (
                    j <= HORIZON * ISLAND_HORIZON_RATIO &&
                    overlay >= ISLAND_PERLIN_CUTOFF
                ) {
                    this.list[i][j] = BLOCK_INTS.iron;
                } else if (
                    j <= HORIZON * CLOUD_HORIZON_RATIO &&
                    overlay >= CLOUD_PERLIN_CUTOFF &&
                    this.list[i][j] === false
                ) {
                    this.list[i][j] = BLOCK_INTS.cloud;
                } else if (
                    j >= HORIZON * CAVE_HORIZON_RATIO &&
                    overlay >= CAVE_PERLIN_CUTOFF
                ) {
                    this.list[i][j] = false;
                }
            }
        }

        // Generate trees
        for (let i = 0; i < LEVEL_WIDTH; i++) {
            let terrainDistFromTop = LEVEL_HEIGHT - this.heightmap[i];
            let r = Math.random();
            if (
                terrainDistFromTop < HORIZON - 3 &&
                r <= TREE_CHANCE * (terrainDistFromTop / LEVEL_HEIGHT)
            ) {
                let treeHeight = (Math.random() * 6 + 4) | 0;
                for (let j = 0; j < treeHeight; j++) {
                    this.list[i][terrainDistFromTop - j] = BLOCK_INTS.wood;
                }
                for (let row = 0; row < treeHeight; row++) {
                    let rowWidth = Math.ceil((treeHeight - row) / 3) * 3 + 1;
                    for (
                        let i1 = i - Math.floor(rowWidth / 2);
                        i1 < i + Math.floor(rowWidth / 2);
                        i1++
                    ) {
                        if (i1 >= LEVEL_WIDTH) {
                            break;
                        }
                        this.list[i1][terrainDistFromTop - treeHeight - row] =
                            BLOCK_INTS.leaves;
                    }
                }
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
            if (water.y > HORIZON && list[water.x][water.y - 1] === false) {
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
