import { BLOCK_INTS } from './blocks.js';
import { BLOCK_SIZE, LEVEL_HEIGHT, LEVEL_WIDTH } from './constants.js';
import ShotHandler from './shothandler.js';
import GridHandler from './gridhandler.js';
import ViewHandler from './viewhandler.js';
import ControlHandler from './controlhandler.js';
import PLAYER_ACTIONS from './actions.js';

export default {
    init(game) {
        this.accel = 0.3;
        this.speed = 2.5;
        this.inventory = {};
        this.inventory[BLOCK_INTS.platform] = 300;
        this.inventory[BLOCK_INTS.wood] = 300;
        this.inventory[BLOCK_INTS.iron] = 10;
        Object.values(BLOCK_INTS).forEach(
            (int) => (this.inventory[int] = this.inventory[int] || 15)
        );
        this.fallSpeed = 8.0;
        this.width = 40;
        this.height = 50;
        this.startHp = 100;
        this.regen = 0.01;
        this.jumpHeight = 14.0;
        this.jumpDelay = 4.0;
        this.actions = PLAYER_ACTIONS;
        this.actions.sort(function (a, b) {
            return a.requiredKills - b.requiredKills;
        });
        this.kills = 0;
        this.action = null;
        this.actionObject = null;
        this.canBuild = false;
        this.shoot = ShotHandler.create.bind(ShotHandler);
        this.halfWidth = game.canvas.width / 2;
        this.halfHeight = game.canvas.height / 2;
        this.x = LEVEL_WIDTH * BLOCK_SIZE * 0.5;
        this.y = this.height * 10;
        this.vX = 0;
        this.vY = 20;
        this.reload = 0;
        this.canJump = 0;
        this.inWater = false;
        this.spaceDown = false;
        this.blockDifficulty = {};
        let bi = Object.values(BLOCK_INTS);
        bi.forEach((k, i) => (this.blockDifficulty[k] = (bi.length - i) * 5));
        console.log(this.blockDifficulty);
        this.hp = this.startHp;
        this.kills = 0;
        this.action = 0;
        this.canBuild = false;
        this.actionObject = this.actions[this.action];
    },
    enterFrame() {
        var accel = this.accel;
        var speed = (this.speed * Math.min(11, 1 + this.kills / 200)) | 0;
        var gridList = GridHandler.list;
        var width = this.width;
        var height = this.height;
        var i, j;
        if (this.hp < this.startHp) {
            this.hp += this.regen;
            if (this.hp > this.startHp) {
                this.hp = this.startHp;
            }
        }
        if (this.underWater) {
            this.hp -= 0.02;
        }
        if (
            this.canJump < 1 &&
            ControlHandler.space &&
            this.spaceDown == false
        ) {
            this.vY =
                (-this.jumpHeight * Math.min(3.5, 1 + this.kills / 500)) | 0;
            this.spaceDown = true;
        }
        if (ControlHandler.space == false && this.spaceDown) {
            this.spaceDown = false;
        }
        if (ControlHandler.a) {
            this.vX -= accel;
            if (this.vX < -speed) {
                this.vX = -speed;
            }
        } else if (ControlHandler.d) {
            this.vX += accel;
            if (this.vX > speed) {
                this.vX = speed;
            }
        } else if (this.vX != 0) {
            if (this.vX > 0) {
                this.vX -= accel;
            } else if (this.vX < 0) {
                this.vX += accel;
            }
            if (this.vX > -accel && this.vX < accel) {
                this.vX = 0;
            }
        }
        var newX = this.x + this.vX;
        var startX = Math.max(((newX - width * 0.5) / BLOCK_SIZE) | 0, 0);
        var startY = Math.max(((this.y - height * 0.5) / BLOCK_SIZE) | 0, 0);
        var endX = Math.min(
            ((newX + width * 0.5 - 1) / BLOCK_SIZE) | 0,
            LEVEL_WIDTH - 1
        );
        var endY = Math.min(
            ((this.y + height * 0.5) / BLOCK_SIZE) | 0,
            LEVEL_HEIGHT - 1
        );
        this.underWater = true;
        for (i = startX; i <= endX; i++) {
            for (j = startY; j <= endY; j++) {
                if (
                    gridList[i][j] !== false &&
                    gridList[i][j] != BLOCK_INTS.cloud &&
                    gridList[i][j] != BLOCK_INTS.platform &&
                    gridList[i][j] != BLOCK_INTS.leaves &&
                    gridList[i][j] != BLOCK_INTS.dark_leaves
                ) {
                    if (gridList[i][j] == BLOCK_INTS.water) {
                        this.inWater = true;
                        if (this.vX > speed * 0.5) {
                            this.vX = speed * 0.5;
                        } else if (this.vX < -speed * 0.5) {
                            this.vX = -speed * 0.5;
                        }
                    } else {
                        if (newX < i * BLOCK_SIZE) {
                            newX = i * BLOCK_SIZE - width * 0.5;
                        } else {
                            newX = i * BLOCK_SIZE + BLOCK_SIZE + width * 0.5;
                        }
                        this.vX = 0;
                    }
                }
                this.underWater =
                    this.underWater &&
                    gridList[i][j] != false &&
                    gridList[i][j] != BLOCK_INTS.cloud;
            }
        }
        this.x = newX;
        var newY;
        if (this.inWater) {
            this.vY += 0.25;
            if (this.vY > this.fallSpeed * 0.3) {
                this.vY = this.fallSpeed * 0.3;
            }
            newY = this.y + this.vY * 0.6;
        } else {
            this.vY += 0.4;
            if (this.vY > this.fallSpeed) {
                this.vY = this.fallSpeed;
            }
            newY = this.y + this.vY;
        }
        var collide = false;
        this.inWater = false;
        startX = Math.max(((this.x - width * 0.5) / BLOCK_SIZE) | 0, 0);
        startY = Math.max(((newY - height * 0.5) / BLOCK_SIZE) | 0, 0);
        endX = Math.min(
            ((this.x + width * 0.5 - 1) / BLOCK_SIZE) | 0,
            LEVEL_WIDTH - 1
        );
        endY = Math.min(
            ((newY + height * 0.5) / BLOCK_SIZE) | 0,
            LEVEL_HEIGHT - 1
        );
        for (i = startX; i <= endX; i++) {
            for (j = startY; j <= endY; j++) {
                if (
                    gridList[i][j] !== false &&
                    gridList[i][j] != BLOCK_INTS.cloud &&
                    gridList[i][j] != BLOCK_INTS.platform &&
                    gridList[i][j] != BLOCK_INTS.leaves &&
                    gridList[i][j] != BLOCK_INTS.dark_leaves
                ) {
                    collide = true;
                    if (gridList[i][j] == BLOCK_INTS.water) {
                        this.inWater = true;
                        this.canJump--;
                    } else {
                        if (newY < j * BLOCK_SIZE) {
                            newY = j * BLOCK_SIZE - height * 0.5 - 0.001;
                            this.canJump--;
                        } else {
                            newY = j * BLOCK_SIZE + BLOCK_SIZE + height * 0.5;
                        }
                        this.vY = 0;
                    }
                }
                if (
                    gridList[i][j] == BLOCK_INTS.platform &&
                    this.vY > 0 &&
                    ControlHandler.s == false
                ) {
                    if (this.y + height * 0.5 < j * BLOCK_SIZE) {
                        newY = j * BLOCK_SIZE - height * 0.5 - 0.001;
                        collide = true;
                        this.vY = 0;
                        this.canJump--;
                    }
                }
            }
        }
        this.y = newY;
        if (collide == false) {
            this.canJump = this.jumpDelay;
        }
        this.reload--;
        if (this.actionObject.count < 0) {
            var offsetX = ViewHandler.x - this.halfWidth;
            var offsetY = ViewHandler.y - this.halfHeight;
            var X = ControlHandler.mouseX + offsetX;
            var Y = ControlHandler.mouseY + offsetY;
            var dist = Math.sqrt(
                Math.pow(this.x - X, 2) + Math.pow(this.y - Y, 2)
            );
            if (dist < 250) {
                this.canBuild = true;
                if (this.reload <= 0 && ControlHandler.mouseLeft) {
                    X = (X / BLOCK_SIZE) | 0;
                    Y = (Y / BLOCK_SIZE) | 0;
                    if (X > 0 && X < LEVEL_WIDTH && Y > 0 && Y < LEVEL_HEIGHT) {
                        if (this.actionObject.count == -1) {
                            if (
                                gridList[X][Y] == false ||
                                gridList[X][Y] == BLOCK_INTS.water ||
                                gridList[X][Y] == BLOCK_INTS.cloud
                            ) {
                                collide = false;
                                let enemy;
                                for (
                                    let i = this.enemyHandler.list.length - 1;
                                    i >= 0;
                                    i--
                                ) {
                                    enemy = this.enemyHandler.list[i];
                                    if (
                                        enemy.x + enemy.width * 0.5 >
                                            X * BLOCK_SIZE &&
                                        (enemy.x - enemy.width * 0.5 <
                                            X * BLOCK_SIZE + BLOCK_SIZE) &
                                            (enemy.y + enemy.height * 0.5 >
                                                Y * BLOCK_SIZE) &&
                                        enemy.y - enemy.height * 0.5 <
                                            Y * BLOCK_SIZE + BLOCK_SIZE
                                    ) {
                                        collide = true;
                                        break;
                                    }
                                }
                                if (
                                    this.x + this.width * 0.5 >
                                        X * BLOCK_SIZE &&
                                    (this.x - this.width * 0.5 <
                                        X * BLOCK_SIZE + BLOCK_SIZE) &
                                        (this.y + this.height * 0.5 >
                                            Y * BLOCK_SIZE) &&
                                    this.y - this.height * 0.5 <
                                        Y * BLOCK_SIZE + BLOCK_SIZE
                                ) {
                                    collide = true;
                                }
                                if (
                                    collide == false &&
                                    this.inventory[this.actionObject.type] > 0
                                ) {
                                    gridList[X][Y] = this.actionObject.type;
                                    this.inventory[this.actionObject.type]--;
                                }
                            }
                        }
                        if (this.actionObject.count == -2) {
                            if (gridList[X][Y] != BLOCK_INTS.bedrock) {
                                let block = gridList[X][Y];
                                if (block == BLOCK_INTS.fire)
                                    block = BLOCK_INTS.wood;
                                gridList[X][Y] = false;
                                this.inventory[block]++;
                                this.reload = this.blockDifficulty[block];
                            }
                        } else {
                            this.reload = this.actionObject.reload;
                        }
                    }
                }
            } else {
                this.canBuild = false;
            }
        } else {
            if (this.reload <= 0 && ControlHandler.mouseLeft) {
                let offsetX = ViewHandler.x - this.halfWidth;
                let offsetY = ViewHandler.y - this.halfHeight;
                for (let i = this.actionObject.count - 1; i >= 0; i--) {
                    if (
                        this.actionObject.conditions == undefined ||
                        this.actionObject.conditions(this)
                    ) {
                        this.shoot(
                            this.x,
                            this.y - 4,
                            ControlHandler.mouseX + offsetX,
                            ControlHandler.mouseY + offsetY,
                            this.actionObject
                        );
                    }
                }
                this.reload = this.actionObject.reload;
            }
        }
    },
    hotKey(keyCode) {
        if (keyCode == 48) {
            keyCode = 58;
        }
        if (keyCode - 49 in this.actions) {
            this.action = keyCode - 49;
            var ao = this.actions[this.action];
            if (ao.requiredKills <= this.kills) {
                this.actionObject = ao;
                this.reload = this.actions[this.action].reload;
            }
        }
    },
    wheel(delta) {
        var dist = 0;
        for (; dist < this.actions.length; dist++) {
            if (this.actions[dist].requiredKills > this.kills) break;
        }
        if (delta > 0) {
            if (this.action <= 0) {
                this.action = dist - 1;
            } else {
                this.action--;
            }
        } else {
            if (this.action >= dist - 1) {
                this.action = 0;
            } else {
                this.action++;
            }
        }
        this.actionObject = this.actions[this.action];
        this.reload = this.actions[this.action].reload;
    },
};
