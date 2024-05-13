import { BLOCK_INTS, BLOCK_COLORS } from './blocks.js';
import ControlHandler from './ControlHandler.js';
import GridHandler from './GridHandler.js';
import RenderHandler, {
    drawGameOverScreen,
    drawMenuScreen,
} from './RenderHandler.js';
import PlayerHandler from './PlayerHandler.js';
import EnemyHandler from './EnemyHandler.js';
import ShotHandler from './ShotHandler.js';
import DustHandler from './DustHandler.js';
import BloodHandler from './BloodHandler.js';
import ViewHandler from './ViewHandler.js';

var newLevelTime = -1;
const Game = {
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
        this.time = 0;
        this.days = 0;
        this.timeIncrement = 0;
        this.handlers.forEach((h) => h.init(this));

        this.time = this.dayLength * 0.37;

        clearInterval(this.updateloop);
        this.updateloop = setInterval(this.enterFrame.bind(this), 1000 / 60);
    },

    enterFrame() {
        this.handlers.forEach((h) => h.enterFrame(this));
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
    window.addEventListener('keydown', ControlHandler.kdelistener);
    window.addEventListener('keyup', ControlHandler.kuelistener);
    window.addEventListener('mousedown', ControlHandler.mdelistener);
    window.addEventListener('mouseup', ControlHandler.muelistener);
    window.addEventListener('mousemove', ControlHandler.mmelistener);

    document.getElementById('canvas').addEventListener('contextmenu', (e) => {
        if (e.button == 2) {
            e.preventDefault();
            return false;
        }
    });
};
