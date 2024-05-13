import { BLOCK_SIZE, LEVEL_HEIGHT, LEVEL_WIDTH } from './constants.js';
import GridHandler from './gridhandler.js';
import PlayerHandler from './playerhandler.js';
import BloodHandler from './bloodhandler.js';
import { BLOCK_INTS } from './blocks.js';

export default {
    init(game) {
        this.startAccel = 0.01;
        this.startSpeed = 0.5;
        this.fallSpeed = 4.0;
        this.startWidth = 36;
        this.startHeight = 46;
        this.jumpHeight = 12.0;
        this.jumpDelay = 12.0;
        this.startHp = 8;
        this.spawnRate = 0.03;
        this.list = [];
        this.pool = [];
        this.game = game;
        this.time = game.time;
        this.blood = BloodHandler.create.bind(BloodHandler);
    },

    enterFrame(game) {
        var gridList = GridHandler.list;
        var enemy, i, j, startX, startY, endX, endY, newX, newY, collide;
        i = this.game.time / this.game.dayLength;
        if ((i < 0.25 || i > 0.75) && Math.random() < this.spawnRate) {
            this.create();
        }

        if (i > 0.25 && i < 0.75 && Math.random() < this.spawnRate / 35) {
            this.create();
        }

        for (var k = this.list.length - 1; k >= 0; k--) {
            enemy = this.list[k];
            if (enemy.hp <= 0) {
                this.pool[this.pool.length] = enemy;
                this.list.splice(k, 1);
                this.blood(enemy.x, enemy.y, 0, 0, 15);
                var mod = PlayerHandler.kills % 50 == 0;
                if (enemy.lastHit == 'shot') PlayerHandler.kills++;
                if (!mod && PlayerHandler.kills % 50 == 0) {
                    game.newLevel = true;
                }
                continue;
            }
            if (enemy.inWater && enemy.y > PlayerHandler.y) {
                enemy.willJump = true;
            }
            if (enemy.canJump < 1 && enemy.willJump) {
                enemy.boredLevel++;
                enemy.vY = -this.jumpHeight;
                enemy.willJump = false;
            }
            if (enemy.boredLevel > 10) enemy.acknowledgeBored = true;
            if (enemy.boredLevel < 0) {
                enemy.acknowledgeBored = false;
                enemy.boredLevel = 0;
            }
            if (
                PlayerHandler.x < enemy.x ||
                (enemy.acknowledgeBored && PlayerHandler.x > enemy.x)
            ) {
                enemy.vX -= enemy.accel;
                enemy.lastDir = -1;
                if (enemy.vX < -enemy.speed) {
                    enemy.vX = -enemy.speed;
                }
                enemy.boredLevel -= 0.01;
            } else if (
                PlayerHandler.x > enemy.x ||
                (enemy.acknowledgeBored && PlayerHandler.x < enemy.x)
            ) {
                enemy.vX += enemy.accel;
                enemy.lastDir = 1;
                if (enemy.vX > enemy.speed) {
                    enemy.vX = enemy.speed;
                }
                enemy.boredLevel -= 0.01;
            }
            newX = enemy.x + enemy.vX;
            startX = Math.max(((newX - enemy.width / 2) / BLOCK_SIZE) | 0, 0);
            startY = Math.max(
                ((enemy.y - enemy.height / 2) / BLOCK_SIZE) | 0,
                0
            );
            endX = Math.min(
                ((newX + enemy.width / 2 - 1) / BLOCK_SIZE) | 0,
                LEVEL_WIDTH - 1
            );
            endY = Math.min(
                ((enemy.y + enemy.height / 2) / BLOCK_SIZE) | 0,
                LEVEL_HEIGHT - 1
            );
            for (i = startX; i <= endX; i++) {
                for (j = startY; j <= endY; j++) {
                    if (
                        gridList[i][j] !== false &&
                        gridList[i][j] != BLOCK_INTS.cloud &&
                        gridList[i][j] != BLOCK_INTS.platform
                    ) {
                        if (this.time % 100 == 0) {
                            let pen = false;
                            if (
                                enemy.level > 8 &&
                                gridList[i][j] == BLOCK_INTS.wood
                            ) {
                                gridList[i][j] = false;
                                pen = true;
                            }
                            if (
                                enemy.level > 5 &&
                                gridList[i][j] == BLOCK_INTS.dirt
                            ) {
                                gridList[i][j] = false;
                                pen = true;
                            }
                            if (pen) continue;
                        }
                        if (gridList[i][j] == BLOCK_INTS.water) {
                            enemy.inWater = true;
                            if (enemy.vX > enemy.speed / 2) {
                                enemy.vX = enemy.speed / 2;
                            } else if (enemy.vX < -enemy.speed / 2) {
                                enemy.vX = -enemy.speed / 2;
                            }
                        } else if (gridList[i][j] == BLOCK_INTS.fire) {
                            this.blood(enemy.x, enemy.y, 0, 0, 2);
                            enemy.hp--;
                        } else {
                            if (newX < i * BLOCK_SIZE) {
                                newX = i * BLOCK_SIZE - enemy.width / 2;
                            } else {
                                newX =
                                    i * BLOCK_SIZE +
                                    BLOCK_SIZE +
                                    enemy.width / 2;
                            }
                            enemy.vX = 0;
                            enemy.willJump = true;
                        }
                    }
                }
            }
            enemy.x = newX;
            if (enemy.inWater) {
                enemy.vY += 0.25;
                if (enemy.vY > this.fallSpeed * 0.3) {
                    enemy.vY = this.fallSpeed * 0.3;
                }
                newY = enemy.y + enemy.vY * 0.6;
            } else {
                enemy.vY += 0.4;
                if (enemy.vY > this.fallSpeed) {
                    enemy.vY = this.fallSpeed;
                }
                newY = enemy.y + enemy.vY;
            }
            collide = false;
            enemy.inWater = false;
            startX = Math.max(
                ((enemy.x - enemy.width / 2) / BLOCK_SIZE) | 0,
                0
            );
            startY = Math.max(((newY - enemy.height / 2) / BLOCK_SIZE) | 0, 0);
            endX = Math.min(
                ((enemy.x + enemy.width / 2 - 1) / BLOCK_SIZE) | 0,
                LEVEL_WIDTH - 1
            );
            endY = Math.min(
                ((newY + enemy.height / 2) / BLOCK_SIZE) | 0,
                LEVEL_HEIGHT - 1
            );
            enemy.underWater = true;
            for (i = startX; i <= endX; i++) {
                for (j = startY; j <= endY; j++) {
                    if (
                        gridList[i][j] !== false &&
                        gridList[i][j] != BLOCK_INTS.cloud &&
                        gridList[i][j] != BLOCK_INTS.platform
                    ) {
                        if (this.time % 100 == 0) {
                            let pen = false;
                            if (
                                enemy.level > 8 &&
                                gridList[i][j] == BLOCK_INTS.wood
                            ) {
                                gridList[i][j] = false;
                                pen = true;
                            }
                            if (
                                enemy.level > 5 &&
                                gridList[i][j] == BLOCK_INTS.dirt
                            ) {
                                gridList[i][j] = false;
                                pen = true;
                            }
                            if (pen) continue;
                        }
                        collide = true;
                        if (gridList[i][j] == BLOCK_INTS.water) {
                            enemy.inWater = true;
                            enemy.canJump--;
                        } else {
                            if (newY < j * BLOCK_SIZE) {
                                newY =
                                    j * BLOCK_SIZE - enemy.height / 2 - 0.001;
                                enemy.canJump--;
                            } else {
                                newY =
                                    j * BLOCK_SIZE +
                                    BLOCK_SIZE +
                                    enemy.height / 2;
                            }
                            enemy.vY = 0;
                        }
                    }
                    if (
                        gridList[i][j] == BLOCK_INTS.platform &&
                        enemy.vY > 0 &&
                        PlayerHandler.y < enemy.y - 1
                    ) {
                        if (enemy.y + enemy.height * 0.5 < j * BLOCK_SIZE) {
                            newY = j * BLOCK_SIZE - enemy.height * 0.5 - 0.001;
                            collide = true;
                            enemy.vY = 0;
                            enemy.canJump--;
                        }
                    }
                    enemy.underWater =
                        enemy.underWater &&
                        gridList[i][j] != false &&
                        gridList[i][j] != BLOCK_INTS.cloud;
                }
            }
            enemy.y = newY;
            if (collide == false) {
                enemy.canJump = this.jumpDelay;
            }
            if (
                enemy.x - enemy.width / 2 <
                    PlayerHandler.x + PlayerHandler.width / 2 &&
                enemy.x + enemy.width / 2 >
                    PlayerHandler.x - PlayerHandler.width / 2 &&
                enemy.y - enemy.height / 2 <
                    PlayerHandler.y + PlayerHandler.height / 2 &&
                enemy.y + enemy.height / 2 >
                    PlayerHandler.y - PlayerHandler.height / 2
            ) {
                this.blood(enemy.x, enemy.y, 0, 0, 5);
                PlayerHandler.hp--;
                PlayerHandler.vX += (PlayerHandler.x - enemy.x) * 0.05;
                PlayerHandler.vY += (PlayerHandler.y - enemy.y) * 0.05;
            }
            if (enemy.underWater) {
                enemy.hp -= 0.004 * ((PlayerHandler.kills / 50) | (0 + 1));
                if (this.game.time % 100 == 0) enemy.lastHit = 'water';
            }
        }
    },

    create() {
        var enemy = {};
        if (this.pool.length > 0) {
            enemy = this.pool.pop();
        }
        if (
            PlayerHandler.x < 500 ||
            (Math.random() < 0.5 &&
                PlayerHandler.x < LEVEL_WIDTH * BLOCK_SIZE - 800)
        ) {
            enemy.x = PlayerHandler.x + 1024 + Math.random() * 200;
        } else {
            enemy.x = PlayerHandler.x - 1024 - Math.random() * 200;
        }
        enemy.y = 50;
        enemy.vX = 0;
        enemy.vY = 10;
        enemy.lastHit = 'shot';
        enemy.acknowledgeBored = false;
        enemy.boredLevel = 0;
        enemy.level = (PlayerHandler.kills / 50) | (0 + 2);
        enemy.hp = this.startHp + enemy.level;
        enemy.accel = this.startAccel * enemy.level;
        enemy.speed = this.startSpeed * enemy.level;
        enemy.width = this.startWidth + enemy.level;
        enemy.height = this.startHeight + enemy.level;
        enemy.canJump = 0;
        enemy.inWater = false;
        enemy.underWater = true;
        this.list[this.list.length] = enemy;
    },
};
