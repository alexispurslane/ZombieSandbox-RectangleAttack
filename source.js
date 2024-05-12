import { BLOCK_INTS, BLOCK_COLORS } from './blocks.js';
import ControlHandler from './controlhandler.js';
import GridHandler from './gridhandler.js';
import RenderHandler from './renderhandler.js';
import PlayerHandler from './playerhandler.js';
import EnemyHandler from './enemyhandler.js';
import ShotHandler from './shothandler.js';
import DustHandler from './dusthandler.js';
import BloodHandler from './bloodhandler.js';
import ViewHandler from './viewhandler.js';
import { HORIZON, LEVEL_HEIGHT, LEVEL_WIDTH } from './constants.js';

// TODO
// 2) Combine all build commands, make material selection window with numbers for each material
// 3) Make multiple selection possible: If multiple materials are selected, build new material from table.
// 4) Make fire send power iron to blocks next to it, replaceing them iwth power_iron
// 5) Make iron power iron next to it as well, like circuitry.
// 6) Allow crafting blocks that respond to power by lighting up, or moving and buttons
// 7) The up moving powerd block is moved up once by being powered, so to make it move up make a line of iron next to it.
// 8) The down moving powerd block is moved down once by being powered, so to make it move up make a line of iron next to it.
// 9) The left moving powerd block is moved left once by being powered, so to make it move up make a line of iron next to it.
// 10) The right moving powerd block is moved right once by being powered, so to make it move up make a line of iron next to it.

var newLevelTime = -1;
const Game = {
    time: 0,
    days: 0,
    timeIncrement: 0,
    dayLength: 470 * 60,

    canvas: document.getElementById('canvas'),
    context: document.getElementById('canvas').getContext('2d'),

    blockCombinations: {
        //stone,wood,dirt
        '2,0,0': BLOCK_INTS.iron,
        '1,0,1': BLOCK_INTS.wood,
        '0,1,1': BLOCK_INTS.platform,
    },
    state: 'menuScreen',

    handlers: [
        ControlHandler,
        GridHandler,
        RenderHandler,
        PlayerHandler,
        EnemyHandler,
        ShotHandler,
        DustHandler,
        BloodHandler,
        ViewHandler,
    ],

    startGame() {
        this.handlers.forEach((h) => h.init(this));

        this.state = 'game';
        this.time = this.dayLength * 0.37;

        setInterval(this.enterFrame.bind(this), 1000 / 60);
    },

    enterFrame() {
        if (this.state == 'menuScreen') {
            drawMenuScreen(this);
            return;
        }
        if (PlayerHandler.hp <= 0) {
            this.state = 'gameOverScreen';
            drawGameOverScreen(this);
            return;
        }
        this.time++;
        if (this.time > this.dayLength) {
            this.time = 0;
            this.days++;
        }
        this.handlers.forEach((h) => h.enterFrame(this));

        if (this.newLevel && this.time - newLevelTime > 10) {
            this.newLevel = false;
            newLevelTime = -1;
        } else if (this.newLevel && newLevelTime < 0) {
            newLevelTime = this.time;
        } else if (this.newLevel) {
            drawNewLevelAlert(this);
        }
    },
};

window.onload = function () {
    Game.startGame();
    document.querySelector('#canvas').width = window.innerWidth;
    document.querySelector('#canvas').height = window.innerHeight;
};
