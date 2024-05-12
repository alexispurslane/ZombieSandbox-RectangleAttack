import ControlHandler from './controlhandler.js';
import GridHandler from './gridhandler.js';
import PlayerHandler from './playerhandler.js';
import EnemyHandler from './enemyhandler.js';
import ShotHandler from './shothandler.js';
import DustHandler from './dusthandler.js';
import BloodHandler from './bloodhandler.js';
import ViewHandler from './viewhandler.js';
import { BLOCK_SIZE, HORIZON, LEVEL_HEIGHT, LEVEL_WIDTH } from './constants.js';
import { BLOCK_INTS, BLOCK_COLORS } from './blocks.js';

export default {
    init(game) {
        this.sunMoonArcRadius = game.canvas.height - 40;
        this.game = game;
        this.canvas = game.canvas;
        this.context = game.context;
        this.timeRatio = (Math.PI * 2) / game.dayLength;
        this.lights = [];
        this.lights = [];
    },
    enterFrame() {
        var context = this.context;
        var gridList = GridHandler.list;
        var blockHalf = BLOCK_SIZE / 2;
        var pX = PlayerHandler.x;
        var pY = PlayerHandler.y;
        var obj, X, Y, i, j, depth, dist;
        dist = this.game.time * this.timeRatio;
        i = Math.sin(dist);
        j = Math.cos(dist);
        var gradient = context.createLinearGradient(
            0,
            0,
            0,
            this.canvas.height
        );
        depth = ((ViewHandler.y / (this.levelHeight * BLOCK_SIZE)) * 250) | 0;
        dist = ((j + 1) * 75) | 0;
        gradient.addColorStop(
            0,
            'rgb(' +
                (77 + depth) +
                ',' +
                (117 + depth) +
                ',' +
                (179 + depth) +
                ')'
        );
        gradient.addColorStop(
            1,
            'rgb(' +
                (127 + depth - dist) +
                ',' +
                (167 + depth - dist) +
                ',' +
                (228 + depth - dist) +
                ')'
        );
        context.fillStyle = gradient;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        X = this.canvas.width * 0.5 + i * this.sunMoonArcRadius;
        Y = this.canvas.height + j * this.sunMoonArcRadius;
        context.fillStyle = '#FEDB16';
        context.beginPath();
        context.arc(X, Y, 30, 0, 6.2832);
        context.fill();
        context.closePath();
        X = this.canvas.width * 0.5 + -i * this.sunMoonArcRadius;
        Y = this.canvas.height + -j * this.sunMoonArcRadius;
        context.fillStyle = '#FFFFFF';
        context.beginPath();
        context.arc(X, Y, 30, 1.2, 4.3416);
        context.fill();
        context.closePath();
        var offsetX = this.canvas.width * 0.5 - ViewHandler.x;
        var offsetY = this.canvas.height * 0.5 - ViewHandler.y;
        context.fillStyle = '#776655';
        Y = Math.round(HORIZON * BLOCK_SIZE + offsetY);
        context.fillRect(0, Y, this.canvas.width, this.canvas.height - Y);
        var startX = Math.max((-offsetX / BLOCK_SIZE) | 0, 0);
        var endX = Math.min(
            startX + Math.ceil(this.canvas.width / BLOCK_SIZE) + 1,
            LEVEL_WIDTH
        );
        var startY = Math.max((-offsetY / BLOCK_SIZE) | 0, 0);
        var endY = Math.min(
            startY + Math.ceil(this.canvas.height / BLOCK_SIZE) + 1,
            LEVEL_HEIGHT
        );
        for (i = startX; i < endX; i++) {
            for (j = startY; j < endY; j++) {
                obj = gridList[i][j];
                if (
                    obj !== false &&
                    obj != BLOCK_INTS.water &&
                    obj != BLOCK_INTS.cloud
                ) {
                    X = Math.round(i * BLOCK_SIZE + offsetX);
                    Y = Math.round(j * BLOCK_SIZE + offsetY);
                    if (obj == BLOCK_INTS.platform) {
                        context.fillStyle = BLOCK_COLORS[obj];
                        context.fillRect(X, Y, BLOCK_SIZE, BLOCK_SIZE * 0.25);
                        context.fillRect(
                            X,
                            Y + BLOCK_SIZE * 0.5,
                            BLOCK_SIZE,
                            BLOCK_SIZE * 0.25
                        );
                    } else if (obj == BLOCK_INTS.fire) {
                        var colors = [
                            '#E25822',
                            '#E27822',
                            '#E29822',
                            '#E2B822',
                            '#E23822',
                            '#E2222C',
                            '#E2224C',
                        ];
                        let color =
                            colors[
                                Math.round(Math.random() * colors.length) - 1
                            ];

                        context.shadowColor = color;
                        context.shadowBlur = Math.round(Math.random() * 70 + 3);
                        context.fillStyle = color;
                        context.fillRect(X, Y, BLOCK_SIZE, BLOCK_SIZE);
                        context.shadowColor = '';
                        context.shadowBlur = 0;
                        context.shadowOffsetX = 0;
                        context.shadowOffsetY = 0;
                    } else if (obj == BLOCK_INTS.leaves) {
                        context.fillStyle = BLOCK_COLORS[obj];
                        context.beginPath();
                        context.moveTo(X + BLOCK_SIZE * 5, Y + BLOCK_SIZE * 2);
                        context.lineTo(X + BLOCK_SIZE / 2, Y - BLOCK_SIZE * 5);
                        context.lineTo(X - BLOCK_SIZE * 4, Y + BLOCK_SIZE * 2);
                        context.fill();
                    } else if (obj == BLOCK_INTS.dark_leaves) {
                        context.fillStyle = BLOCK_COLORS[obj];
                        context.beginPath();
                        context.moveTo(X + BLOCK_SIZE * 5, Y + BLOCK_SIZE * 2);
                        context.lineTo(X + BLOCK_SIZE * 5, Y - BLOCK_SIZE * 2);
                        context.lineTo(X - BLOCK_SIZE * 4, Y - BLOCK_SIZE * 2);
                        context.lineTo(X - BLOCK_SIZE * 4, Y + BLOCK_SIZE * 2);
                        context.fill();
                    } else {
                        context.fillStyle = BLOCK_COLORS[obj];
                        context.fillRect(X, Y, BLOCK_SIZE, BLOCK_SIZE);
                    }
                }
                if (
                    obj === false &&
                    j == HORIZON &&
                    gridList[i][j - 1] === false
                ) {
                    X = Math.round(i * BLOCK_SIZE + offsetX);
                    Y = Math.round(j * BLOCK_SIZE + offsetY);
                    context.fillStyle = 'rbga(0,0,0,0.2)';
                    context.fillRect(X + 1, Y, 2, 2);
                    context.fillRect(X + 5, Y, 3, 3);
                    context.fillRect(X + 11, Y, 2, 2);
                }
            }
        }

        X = Math.round(pX + offsetX - PlayerHandler.width / 2);
        Y = Math.round(pY + offsetY - PlayerHandler.height / 2);
        context.fillStyle = '#333333';
        context.fillRect(X, Y, PlayerHandler.width, PlayerHandler.height);

        for (i = EnemyHandler.list.length - 1; i >= 0; i--) {
            obj = EnemyHandler.list[i];
            context.fillStyle = '#774444';
            context.fillRect(
                Math.round(obj.x + offsetX - obj.width * 0.5),
                Math.round(obj.y + offsetY - obj.height * 0.5),
                obj.width,
                obj.height
            );
        }
        context.fillStyle = '#333333';
        for (i = ShotHandler.list.length - 1; i >= 0; i--) {
            obj = ShotHandler.list[i];
            dist = ShotHandler.size;
            context.fillRect(
                Math.round(obj.x + offsetX - dist / 2),
                Math.round(obj.y + offsetY - dist / 2),
                dist,
                dist
            );
        }
        context.fillStyle = '#555555';
        for (i = DustHandler.list.length - 1; i >= 0; i--) {
            obj = DustHandler.list[i];
            dist = DustHandler.size * (obj.hp / DustHandler.startHp);
            context.fillRect(
                Math.round(obj.x + offsetX - dist * 0.5),
                Math.round(obj.y + offsetY - dist * 0.5),
                dist,
                dist
            );
        }
        context.fillStyle = '#AA4444';
        for (i = BloodHandler.list.length - 1; i >= 0; i--) {
            obj = BloodHandler.list[i];
            dist = BloodHandler.size * (obj.hp / BloodHandler.startHp);
            context.fillRect(
                Math.round(obj.x + offsetX - dist * 0.5),
                Math.round(obj.y + offsetY - dist * 0.5),
                dist,
                dist
            );
        }
        for (i = startX; i < endX; i++) {
            for (j = startY; j < endY; j++) {
                obj = gridList[i][j];
                if (
                    obj == BLOCK_INTS.dirt &&
                    j <= HORIZON &&
                    (gridList[i][j - 1] === false ||
                        gridList[i][j - 1] == BLOCK_INTS.cloud)
                ) {
                    X = Math.round(i * BLOCK_SIZE + offsetX);
                    Y = Math.round(j * BLOCK_SIZE + offsetY);
                    context.fillStyle = 'rgba(45,130,45,0.75)';
                    context.fillRect(X, Y - 3, BLOCK_SIZE, 3);
                    context.fillRect(X + 1, Y - 5, 2, 2);
                    context.fillRect(X + 5, Y - 5, 3, 2);
                    context.fillRect(X + 11, Y - 5, 2, 2);
                }
                if (obj == BLOCK_INTS.water || obj == BLOCK_INTS.cloud) {
                    X = Math.round(i * BLOCK_SIZE + offsetX);
                    Y = Math.round(j * BLOCK_SIZE + offsetY);
                    context.fillStyle = BLOCK_COLORS[obj];
                    context.fillRect(X, Y, BLOCK_SIZE, BLOCK_SIZE);
                }
                if (
                    obj == BLOCK_INTS.water &&
                    j <= HORIZON &&
                    (gridList[i][j - 1] === false ||
                        gridList[i][j - 1] == BLOCK_INTS.cloud)
                ) {
                    context.fillStyle = 'rgba(255,255,255,0.2)';
                    context.fillRect(X, Y, BLOCK_SIZE, 6);
                    context.fillRect(X, Y, BLOCK_SIZE / 2, 3);
                }
            }
        }
        for (i = startX; i < endX; i++) {
            var depth = 0;
            for (j = 0; j < endY; j++) {
                obj = gridList[i][j];
                if (
                    (obj != BLOCK_INTS.bedrock &&
                        obj != BLOCK_INTS.cloud &&
                        obj != false &&
                        obj != BLOCK_INTS.fire) ||
                    j >= HORIZON
                ) {
                    X = i * BLOCK_SIZE;
                    Y = j * BLOCK_SIZE;
                    var dists = this.lights.map((l) => {
                        let lX = l.x * BLOCK_SIZE;
                        let lY = l.y * BLOCK_SIZE;
                        return (
                            Math.pow(lX - X - blockHalf, 2) +
                            Math.pow(lY - Y - blockHalf, 2)
                        );
                    });
                    dists.push(
                        Math.pow(pX - X - blockHalf, 2) +
                            Math.pow(pY - Y - blockHalf, 2)
                    );
                    dist = Math.min(...dists);
                    X = Math.round(X + offsetX);
                    Y = Math.round(Y + offsetY);
                    context.fillStyle =
                        'rgba(0,0,0,' +
                        depth *
                            0.02 *
                            Math.max(Math.min(dist / 16000, 1), 0.4) +
                        ')';
                    context.fillRect(X, Y, BLOCK_SIZE, BLOCK_SIZE);
                    if (obj == BLOCK_INTS.platform) {
                        depth += 0.2;
                    } else if (obj == BLOCK_INTS.water) {
                        depth += 0.5;
                    } else if (obj == BLOCK_INTS.wood) {
                        depth += 0.8;
                    } else if (obj == BLOCK_INTS.fire) {
                        depth -= 10;
                    } else {
                        depth += 1;
                    }
                }
            }
        }
        depth = Math.min(Math.cos(this.game.time * this.timeRatio) + 0.3, 0.5);
        if (depth > 0) {
            context.fillStyle = 'rgba(0,0,0,' + depth + ')';
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (PlayerHandler.actionObject.count < 0 && PlayerHandler.canBuild) {
            context.fillStyle = 'rgba(0,0,0,0.2)';
            context.fillRect(
                (((ControlHandler.mouseX - offsetX) / BLOCK_SIZE) | 0) *
                    BLOCK_SIZE +
                    offsetX,
                (((ControlHandler.mouseY - offsetY) / BLOCK_SIZE) | 0) *
                    BLOCK_SIZE +
                    offsetY,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
        }
        context.fillStyle = '#444444';
        context.fillRect(0, 0, this.canvas.width, 20);
        context.textAlign = 'left';
        context.font = 'bold 11px/1 Arial';
        context.fillStyle = '#AAAAAA';
        context.fillText('H', 5, 10);
        context.fillText('K', 85, 10);
        context.font = 'bold 15px/1 Arial';
        context.fillStyle = '#DDDDDD';
        context.fillText(Math.round(PlayerHandler.hp), 15, 10);
        context.fillText(Math.round(PlayerHandler.kills), 95, 10);
        if (PlayerHandler.reload >= 0) {
            context.fillStyle = 'red';
        } else if (PlayerHandler.reload <= -180) {
            context.fillStyle = 'green';
        } else {
            context.fillStyle = 'blue';
        }
        context.fillRect(
            this.canvas.width - 5,
            25,
            Math.max(PlayerHandler.reload, -this.canvas.width + 5),
            15
        );
        var cf = context.fillStyle;
        context.textAlign = 'right';
        PlayerHandler.actions.forEach((x, i) => {
            if (x.requiredKills <= PlayerHandler.kills) {
                context.font = 'bold 20px/1 Helvetica';
                if (i == PlayerHandler.action) {
                    context.fillStyle = 'orange';
                } else {
                    context.fillStyle = cf;
                }
                let str = x.name;
                if (x.type) {
                    str += ' x' + PlayerHandler.inventory[x.type];
                }
                context.fillText(str, this.canvas.width - 5, (i + 1) * 20 + 33);
            }
        });
    },
};

function drawGameOverScreen(game) {
    game.state = 'gameOverScreen';
    ControlHandler.mouseLeft = false;
    game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    var hW = game.canvas.width * 0.5;
    var hH = game.canvas.height * 0.5;
    var dark = 'rgba(0,0,0,0.9)';
    var medium = 'rgba(0,0,0,0.5)';
    var light = 'rgba(0,0,0,0.3)';
    drawText(
        game.context,
        'Zombie Sandbox: Rectangle Attack',
        hW,
        hH - 150,
        'normal 80px/1 ' + titleFontFamily,
        'rgba(0, 255, 10, 1)',
        'center'
    );
    drawText(
        game.context,
        'Game Over!',
        hW,
        hH - 70,
        'normal 22px/1 ' + fontFamily,
        dark
    );
    drawText(
        game.context,
        'Kills:' + PlayerHandler.kills,
        hW,
        hH - 30,
        'normal 16px/1 ' + fontFamily,
        medium
    );
    drawText(
        game.context,
        'Click to Restart',
        hW,
        hH + 10,
        'normal 17px/1 ' + fontFamily,
        dark
    );
}

function drawNewLevelAlert(game) {
    game.context.fillStyle = 'black';
    game.context.fillRect(5, 15, game.canvas.width / 5, 400);
    var dark = 'rgba(255,255,255,1)';
    drawText(
        game.context,
        'New Level: ' + (game.PlayerHandler.kills % 50),
        10,
        20,
        'normal 30px/1 ' + titleFontFamily,
        dark,
        'left'
    );
    drawText(
        game.context,
        'You earn a new level every time you make 50 kills.',
        10,
        50,
        'normal 15px/1 ' + fontFamily,
        dark,
        'left'
    );
    drawText(
        game.context,
        'Every few levels, you will gain new weapons and materials.',
        10,
        65,
        'normal 15px/1 ' + fontFamily,
        dark,
        'left'
    );
}

var frame = 0;
var lastFrame = 0;
var toggle = true;
function drawMenuScreen(game) {
    game.state = 'menuScreen';
    ControlHandler.mouseLeft = false;

    var gradient = game.context.createLinearGradient(
        0,
        0,
        0,
        game.canvas.height
    );
    depth = ((ViewHandler.y / (LEVEL_HEIGHT * BLOCK_SIZE)) * 250) | 0;
    dist = ((20 + 1) * 75) | 0;
    gradient.addColorStop(
        0,
        'rgb(' + (77 + depth) + ',' + (117 + depth) + ',' + (179 + depth) + ')'
    );
    gradient.addColorStop(
        1,
        'rgb(' +
            (127 + depth - dist) +
            ',' +
            (167 + depth - dist) +
            ',' +
            (228 + depth - dist) +
            ')'
    );

    game.context.fillStyle = gradient;
    game.context.fillRect(0, 0, game.canvas.width, game.canvas.height);
    var hW = game.canvas.width * 0.5;
    var hH = game.canvas.height * 0.5;
    var dark = 'rgba(255,255,255,1)';
    var medium = 'rgba(155,155,155,1)';
    var light = 'rgba(55,55,55,1)';
    drawText(
        game.context,
        'Zombie Sandbox: Rectangle Attack',
        hW,
        hH - 150,
        'normal 80px/1 ' + titleFontFamily,
        'rgba(0, 255, 10, 1)',
        'center'
    );
    if (lastFrame == frame - 50) {
        toggle = !toggle;
        lastFrame = frame;
    }
    if (toggle)
        drawText(
            game.context,
            'Click to Start',
            hW,
            hH - 70,
            'normal 17px/1 ' + fontFamily,
            dark
        );
    drawText(
        game.context,
        'Use "A" and "D" to move and "Space" to jump.',
        hW,
        hH - 30,
        'normal 15px/1 ' + fontFamily,
        medium
    );
    drawText(
        game.context,
        'Use arrow keys to change action and left click to perform action.',
        hW,
        hH - 10,
        'normal 15px/1 ' + fontFamily,
        medium
    );
    drawText(
        game.context,
        'Beware the night! Kill to advance!',
        hW,
        hH + 30,
        'normal 15px/1 ' + titleFontFamily,
        medium
    );
    frame++;
}

function drawText(context, text, x, y, font, style, align, baseline) {
    context.font = typeof font === 'undefined' ? 'normal 16px/1 Arial' : font;
    context.fillStyle = typeof style === 'undefined' ? '#000000' : style;
    context.textAlign = typeof align === 'undefined' ? 'center' : align;
    context.textBaseline =
        typeof baseline === 'undefined' ? 'middle' : baseline;
    context.fillText(text, x, y);
}
