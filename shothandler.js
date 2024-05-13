import DustHandler from './dusthandler.js';
import BloodHandler from './bloodhandler.js';
import EnemyHandler from './enemyhandler.js';
import GridHandler from './gridhandler.js';
import RenderHandler from './renderhandler.js';
import { BLOCK_INTS } from './blocks.js';
import { BLOCK_SIZE, LEVEL_HEIGHT, LEVEL_WIDTH } from './constants.js';
import PlayerHandler from './playerhandler.js';

export default {
    size: 5,
    actions: [
        false,
        {
            name: 'Explode1',
            count: 30,
            speed: 4,
            hp: 15,
            modY: 0,
            explode: 0,
            spread: 0,
            damage: 1,
            destroy: [BLOCK_INTS.dirt],
        },
        {
            name: 'Explode2',
            count: 30,
            speed: 4,
            hp: 15,
            modY: 0,
            explode: 0,
            spread: 0,
            damage: 2,
            destroy: [BLOCK_INTS.wood, BLOCK_INTS.dirt],
        },
        {
            name: 'Explode3',
            count: 90,
            speed: 20,
            hp: 60,
            modY: 0,
            explode: 0,
            spread: 0,
            damage: 5,
            destroy: [BLOCK_INTS.wood, BLOCK_INTS.dirt, BLOCK_INTS.stone],
        },
    ],
    init(game) {
        this.list = [];
        this.pool = [];
        this.dust = DustHandler.create.bind(DustHandler);
        this.blood = BloodHandler.create.bind(BloodHandler);
    },
    enterFrame() {
        var gridList = GridHandler.list;
        var shot, enemy, j, X, Y;
        for (var i = this.list.length - 1; i >= 0; i--) {
            shot = this.list[i];
            shot.x += shot.vX;
            shot.y += shot.vY;
            shot.vY += shot.modY;
            shot.hp--;
            X = (shot.x / BLOCK_SIZE) | 0;
            Y = (shot.y / BLOCK_SIZE) | 0;
            if (X >= 0 && X < LEVEL_WIDTH && Y >= 0 && Y < LEVEL_HEIGHT) {
                if (gridList[X][Y] == BLOCK_INTS.water) {
                    shot.x -= shot.vX * 0.5;
                    shot.y -= shot.vY * 0.5;
                } else if (
                    gridList[X][Y] !== false &&
                    gridList[X][Y] != BLOCK_INTS.cloud &&
                    gridList[X][Y] != BLOCK_INTS.leaves &&
                    gridList[X][Y] != BLOCK_INTS.fire
                ) {
                    var g = gridList[X][Y];
                    var stonePenetration =
                        g === BLOCK_INTS.stone &&
                        Math.random() > 0.65 &&
                        shot.name === 'Explode3';
                    var woodPenetration =
                        g === BLOCK_INTS.wood &&
                        Math.random() > 0.55 &&
                        shot.name === 'Explode2';
                    if (
                        (shot.destroy.indexOf(g) > -1 || stonePenetration) &&
                        g != BLOCK_INTS.bedrock
                    ) {
                        PlayerHandler.inventory[gridList[X][Y]]++;
                        gridList[X][Y] = false;
                    }
                    if (shot.flammable && g == BLOCK_INTS.wood) {
                        if (
                            gridList[X + 1][Y] != BLOCK_INTS.water &&
                            gridList[X - 1][Y] != BLOCK_INTS.water &&
                            gridList[X][Y - 1] != BLOCK_INTS.water &&
                            gridList[X][Y + 1] != BLOCK_INTS.water
                        ) {
                            gridList[X][Y] = BLOCK_INTS.fire;
                            GridHandler.fireList.push({
                                x: X,
                                y: Y,
                                t: 0,
                            });
                            RenderHandler.lights.push({ x: X, y: Y });
                        } else {
                            gridList[X][Y] = false;
                        }
                    }
                    shot.hp = -99;
                    this.dust(
                        shot.x - shot.vX,
                        shot.y - shot.vY,
                        shot.vX * 0.2,
                        shot.vY * 0.2,
                        4
                    );
                }
            }
            for (j = EnemyHandler.list.length - 1; j >= 0; j--) {
                enemy = EnemyHandler.list[j];
                if (
                    shot.x + 2 > enemy.x - enemy.width * 0.5 &&
                    shot.x - 2 < enemy.x + enemy.width * 0.5 &&
                    shot.y + 2 > enemy.y - enemy.height * 0.5 &&
                    shot.y - 2 < enemy.y + enemy.height * 0.5
                ) {
                    enemy.hp -= shot.damage;
                    enemy.lastHit = 'shot';
                    enemy.vX = shot.vX * 0.03;
                    enemy.vY = shot.vY * 0.03;
                    shot.hp = -99;
                    this.blood(shot.x, shot.y, shot.vX * 0.4, shot.vY * 0.4, 4);
                }
            }
            if (shot.hp == -99 && shot.explode > 0) {
                for (j = this.actions[shot.explode].count - 1; j >= 0; j--) {
                    this.create(
                        shot.x,
                        shot.y,
                        shot.x + Math.random() * 10 - 5,
                        shot.y + Math.random() * 10 - 5,
                        this.actions[shot.explode]
                    );
                }
            }
            if (shot.hp <= 0) {
                this.pool[this.pool.length] = shot;
                this.list.splice(i, 1);
                continue;
            }
        }
    },
    create(sX, sY, eX, eY, action) {
        var shot = {};
        if (this.pool.length > 0) {
            shot = this.pool.pop();
        }
        shot.x = sX;
        shot.y = sY;
        shot.vX = eX - sX;
        shot.vY = eY - sY;
        var dist = Math.sqrt(shot.vX * shot.vX + shot.vY * shot.vY);
        shot.vX =
            (shot.vX / dist) * action.speed +
            Math.random() * action.spread * 2 -
            action.spread;
        shot.vY =
            (shot.vY / dist) * action.speed +
            Math.random() * action.spread * 2 -
            action.spread;
        shot.modY = action.modY;
        shot.hp = action.hp;
        shot.explode = action.explode;
        shot.damage = action.damage;
        shot.flammable = action.flammable;
        shot.name = action.name;
        shot.destroy = action.destroy;
        this.list[this.list.length] = shot;
    },
};
