import ControlHandler from './ControlHandler.js';
import GridHandler from './GridHandler.js';
import PlayerHandler from './PlayerHandler.js';
import EnemyHandler from './EnemyHandler.js';
import ShotHandler from './ShotHandler.js';
import DustHandler from './DustHandler.js';
import BloodHandler from './BloodHandler.js';
import ViewHandler from './ViewHandler.js';
import {
    BLOCK_SIZE,
    HORIZON,
    LEVEL_HEIGHT,
    LEVEL_WIDTH,
    fontFamily,
} from './constants.js';
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
        this.offsetX = this.canvas.width * 0.5 - ViewHandler.x;
        this.offsetY = this.canvas.height * 0.5 - ViewHandler.y;

        this.startX = Math.max((-this.offsetX / BLOCK_SIZE) | 0, 0);
        this.endX = Math.min(
            this.startX + Math.ceil(this.canvas.width / BLOCK_SIZE) + 1,
            LEVEL_WIDTH
        );
        this.startY = Math.max((-this.offsetY / BLOCK_SIZE) | 0, 0);
        this.endY = Math.min(
            this.startY + Math.ceil(this.canvas.height / BLOCK_SIZE) + 1,
            LEVEL_HEIGHT
        );

        this.drawBackground(this.game.time * this.timeRatio);

        this.drawMap();

        this.drawPlayer();

        this.drawZombies();

        this.drawShots();

        this.drawDust();

        this.drawBlood();

        // Draws water, clouds, and shadows, which need to draw over the above things.
        this.drawMapOverDraw();

        // Darken things if you're very deep
        let depth = Math.min(
            Math.cos(this.game.time * this.timeRatio) + 0.3,
            0.5
        );
        if (depth > 0) {
            this.context.fillStyle = 'rgba(0,0,0,' + depth + ')';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.drawUI();
    },

    drawBackground(time) {
        let i = Math.sin(time);
        let j = Math.cos(time);
        let depth =
            (LEVEL_HEIGHT -
                (ViewHandler.y / (LEVEL_HEIGHT * BLOCK_SIZE)) * 250) |
            0;
        let dist = ((j + 1) * 75) | 0;
        var gradient = this.context.createLinearGradient(
            0,
            0,
            0,
            this.canvas.height
        );
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
        // Draw sky
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw sun
        {
            let X = this.canvas.width * 0.5 + i * this.sunMoonArcRadius;
            let Y = this.canvas.height + j * this.sunMoonArcRadius;
            this.context.fillStyle = '#FEDB16';
            this.context.beginPath();
            this.context.arc(X, Y, 30, 0, 6.2832);
            this.context.fill();
            this.context.closePath();
        }

        {
            let X = this.canvas.width * 0.5 + -i * this.sunMoonArcRadius;
            let Y = this.canvas.height + -j * this.sunMoonArcRadius;
            this.context.fillStyle = '#FFFFFF';
            this.context.beginPath();
            this.context.arc(X, Y, 30, 1.2, 4.3416);
            this.context.fill();
            this.context.closePath();
        }

        // Draw background of ground
        {
            this.context.fillStyle = '#776655';
            let Y = Math.round(HORIZON * BLOCK_SIZE + this.offsetY);
            this.context.fillRect(
                0,
                Y,
                this.canvas.width,
                this.canvas.height - Y
            );
        }
    },

    drawMap() {
        for (let i = this.startX; i < this.endX; i++) {
            let depth = 0;
            for (let j = 0; j < this.endY; j++) {
                let obj = GridHandler.list[i][j];

                if (j > this.startY) {
                    let X = Math.round(i * BLOCK_SIZE + this.offsetX);
                    let Y = Math.round(j * BLOCK_SIZE + this.offsetY);
                    if (
                        obj !== false &&
                        obj != BLOCK_INTS.water &&
                        obj != BLOCK_INTS.cloud
                    ) {
                        if (obj == BLOCK_INTS.platform) {
                            this.context.fillStyle = BLOCK_COLORS[obj];
                            this.context.fillRect(
                                X,
                                Y,
                                BLOCK_SIZE,
                                BLOCK_SIZE * 0.25
                            );
                            this.context.fillRect(
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
                                    Math.round(Math.random() * colors.length) -
                                        1
                                ];

                            this.context.fillStyle = color;
                            this.context.fillRect(X, Y, BLOCK_SIZE, BLOCK_SIZE);
                        } else {
                            this.context.fillStyle = BLOCK_COLORS[obj];
                            this.context.fillRect(X, Y, BLOCK_SIZE, BLOCK_SIZE);
                        }
                    }
                    if (
                        obj === false &&
                        j == HORIZON &&
                        GridHandler.list[i][j - 1] === false
                    ) {
                        this.context.fillStyle = 'rbga(0,0,0,0.2)';
                        this.context.fillRect(X + 1, Y, 2, 2);
                        this.context.fillRect(X + 5, Y, 3, 3);
                        this.context.fillRect(X + 11, Y, 2, 2);
                    }
                }
                if (
                    obj != BLOCK_INTS.bedrock &&
                    obj != BLOCK_INTS.cloud &&
                    obj != false &&
                    obj != BLOCK_INTS.fire
                ) {
                    let X = i * BLOCK_SIZE;
                    let Y = j * BLOCK_SIZE;
                    X = Math.round(X + this.offsetX);
                    Y = Math.round(Y + this.offsetY);
                    this.context.fillStyle =
                        'rgba(0,0,0,' + depth * 0.02 * 0.4 + ')';
                    this.context.fillRect(X, Y, BLOCK_SIZE, BLOCK_SIZE);
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
    },

    drawPlayer() {
        this.context.fillStyle = '#333333';
        let X = Math.round(
            PlayerHandler.x + this.offsetX - PlayerHandler.width / 2
        );
        let Y = Math.round(
            PlayerHandler.y + this.offsetY - PlayerHandler.height / 2
        );
        this.context.fillRect(X, Y, PlayerHandler.width, PlayerHandler.height);
    },

    drawZombies() {
        this.context.fillStyle = '#698362';
        for (let i = EnemyHandler.list.length - 1; i >= 0; i--) {
            let obj = EnemyHandler.list[i];
            this.context.fillRect(
                Math.round(obj.x + this.offsetX - obj.width * 0.5),
                Math.round(obj.y + this.offsetY - obj.height * 0.5),
                obj.width,
                obj.height
            );
        }
    },

    drawShots() {
        this.context.fillStyle = '#333333';
        for (let i = ShotHandler.list.length - 1; i >= 0; i--) {
            let obj = ShotHandler.list[i];
            let dist = ShotHandler.size;
            this.context.fillRect(
                Math.round(obj.x + this.offsetX - dist / 2),
                Math.round(obj.y + this.offsetY - dist / 2),
                dist,
                dist
            );
        }
    },

    drawDust() {
        this.context.fillStyle = '#555555';
        for (let i = DustHandler.list.length - 1; i >= 0; i--) {
            let obj = DustHandler.list[i];
            let dist = DustHandler.size * (obj.hp / DustHandler.startHp);
            this.context.fillRect(
                Math.round(obj.x + this.offsetX - dist * 0.5),
                Math.round(obj.y + this.offsetY - dist * 0.5),
                dist,
                dist
            );
        }
    },

    drawBlood() {
        this.context.fillStyle = '#AA4444';
        for (let i = BloodHandler.list.length - 1; i >= 0; i--) {
            let obj = BloodHandler.list[i];
            let dist = BloodHandler.size * (obj.hp / BloodHandler.startHp);
            this.context.fillRect(
                Math.round(obj.x + this.offsetX - dist * 0.5),
                Math.round(obj.y + this.offsetY - dist * 0.5),
                dist,
                dist
            );
        }
    },

    drawMapOverDraw() {
        for (let i = this.startX; i < this.endX; i++) {
            for (let j = this.startY; j < this.endY; j++) {
                let obj = GridHandler.list[i][j];
                let X = Math.round(i * BLOCK_SIZE + this.offsetX);
                let Y = Math.round(j * BLOCK_SIZE + this.offsetY);
                if (
                    obj == BLOCK_INTS.dirt &&
                    j <= HORIZON &&
                    (GridHandler.list[i][j - 1] === false ||
                        GridHandler.list[i][j - 1] == BLOCK_INTS.cloud)
                ) {
                    this.context.fillStyle = 'rgba(45,130,45,0.75)';
                    this.context.fillRect(X, Y - 3, BLOCK_SIZE, 3);
                    this.context.fillRect(X + 1, Y - 5, 2, 2);
                    this.context.fillRect(X + 5, Y - 5, 3, 2);
                    this.context.fillRect(X + 11, Y - 5, 2, 2);
                }
                if (obj == BLOCK_INTS.water || obj == BLOCK_INTS.cloud) {
                    this.context.fillStyle = BLOCK_COLORS[obj];
                    this.context.fillRect(X, Y, BLOCK_SIZE, BLOCK_SIZE);
                }
                if (
                    obj == BLOCK_INTS.water &&
                    j <= HORIZON &&
                    (GridHandler.list[i][j - 1] === false ||
                        GridHandler.list[i][j - 1] == BLOCK_INTS.cloud)
                ) {
                    this.context.fillStyle = 'rgba(255,255,255,0.2)';
                    this.context.fillRect(X, Y, BLOCK_SIZE, 6);
                    this.context.fillRect(X, Y, BLOCK_SIZE / 2, 3);
                }
            }
        }
    },

    drawUI() {
        if (
            PlayerHandler.actionObject.count === undefined &&
            PlayerHandler.canBuild
        ) {
            this.context.fillStyle = 'rgba(0,0,0,0.2)';
            this.context.fillRect(
                (((ControlHandler.mouseX - this.offsetX) / BLOCK_SIZE) | 0) *
                    BLOCK_SIZE +
                    this.offsetX,
                (((ControlHandler.mouseY - this.offsetY) / BLOCK_SIZE) | 0) *
                    BLOCK_SIZE +
                    this.offsetY,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
        }

        this.context.fillStyle = '#444444';
        this.context.fillRect(0, 0, this.canvas.width, 20);
        this.context.textAlign = 'left';
        this.context.font = 'bold 11px/1 Arial';
        this.context.fillStyle = '#AAAAAA';
        this.context.fillText('H', 5, 10);
        this.context.fillText('K', 85, 10);
        this.context.font = 'bold 15px/1 Arial';
        this.context.fillStyle = '#DDDDDD';
        this.context.fillText(Math.round(PlayerHandler.hp), 15, 10);
        this.context.fillText(Math.round(PlayerHandler.kills), 95, 10);
        if (PlayerHandler.reload >= 0) {
            this.context.fillStyle = 'red';
        } else if (PlayerHandler.reload <= -180) {
            this.context.fillStyle = 'green';
        } else {
            this.context.fillStyle = 'blue';
        }
        this.context.fillRect(
            this.canvas.width - 5,
            25,
            Math.max(PlayerHandler.reload, -this.canvas.width + 5),
            15
        );
        var cf = this.context.fillStyle;
        this.context.textAlign = 'right';
        PlayerHandler.actions.forEach((x, i) => {
            if (x.requiredKills <= PlayerHandler.kills) {
                this.context.font = 'bold 20px/1 Helvetica';
                if (i == PlayerHandler.action) {
                    this.context.fillStyle = 'orange';
                } else {
                    this.context.fillStyle = cf;
                }
                let str = x.name;
                if (x.type) {
                    str += ' x' + PlayerHandler.inventory[x.type];
                }
                this.context.fillText(
                    str,
                    this.canvas.width - 5,
                    (i + 1) * 20 + 33
                );
            }
        });
    },
};

export function drawGameOverScreen(game) {
    game.state = 'gameOverScreen';
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
        'normal 80px/1 Shlop',
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
        'normal 30px/1 Shlop',
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
export function drawMenuScreen(game) {
    game.state = 'menuScreen';

    let gradient = game.context.createLinearGradient(
        0,
        0,
        0,
        game.canvas.height
    );
    let depth = ((ViewHandler.y / (LEVEL_HEIGHT * BLOCK_SIZE)) * 250) | 0;
    let dist = ((20 + 1) * 75) | 0;
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
        'Zombie Sandbox: Rectangle Attack!',
        hW,
        hH - 150,
        'normal 80px/1 Shlop',
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
        'normal 15px/1 Shlop',
        medium
    );
    frame++;
}

export function drawText(context, text, x, y, font, style, align, baseline) {
    context.font = typeof font === 'undefined' ? 'normal 16px/1 Arial' : font;
    context.fillStyle = typeof style === 'undefined' ? '#000000' : style;
    context.textAlign = typeof align === 'undefined' ? 'center' : align;
    context.textBaseline =
        typeof baseline === 'undefined' ? 'middle' : baseline;
    context.fillText(text, x, y);
}
