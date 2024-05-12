import PlayerHandler from './playerhandler.js';

export default {
    a: false,
    d: false,
    s: false,
    space: false,
    mouseLeft: false,
    mouseRight: false,
    mouseX: 0,
    mouseY: 0,

    init(game) {
        this.game = game;
        this.canvas = game.canvas;
        window.addEventListener('keydown', this.keyDownEvent.bind(this));
        window.addEventListener('keyup', this.keyUpEvent.bind(this));
        window.addEventListener('mousedown', this.mouseDownEvent.bind(this));
        window.addEventListener('mouseup', this.mouseUpEvent.bind(this));
        window.addEventListener('mousemove', this.mouseMoveEvent.bind(this));
        document
            .getElementById('canvas')
            .addEventListener('contextmenu', (e) => {
                if (e.button == 2) {
                    e.preventDefault();
                    return false;
                }
            });
    },

    enterFrame() {},

    keyDownEvent(e) {
        if (e.keyCode == 32) {
            this.space = true;
        } else if (e.keyCode == 65) {
            this.a = true;
        } else if (e.keyCode == 68) {
            this.d = true;
        } else if (e.keyCode == 83) {
            this.s = true;
        } else if (e.keyCode == 87) {
            this.space = true;
        } else if (e.keyCode == 88) {
            this.mouseLeft = true;
        } else if (
            (e.keyCode >= 48 || e.keyCode <= 57) &&
            this.game.state == 'game'
        ) {
            PlayerHandler.hotKey(e.keyCode);
        }
        if (e.ctrlKey) {
            return true;
        } else {
            e.preventDefault();
            return false;
        }
    },

    keyUpEvent(e) {
        if (e.keyCode == 32) {
            this.space = false;
        } else if (e.keyCode == 65) {
            this.a = false;
        } else if (e.keyCode == 68) {
            this.d = false;
        } else if (e.keyCode == 87) {
            this.space = false;
        } else if (e.keyCode == 88) {
            this.mouseLeft = false;
        } else if (e.keyCode == 83) {
            this.s = false;
        } else if (e.keyCode == 40) {
            PlayerHandler.wheel(-100);
        } else if (e.keyCode == 38) {
            PlayerHandler.wheel(100);
        }
        if (e.ctrlKey) {
            return true;
        } else {
            e.preventDefault();
            return false;
        }
    },

    mouseDownEvent(e) {
        this.mouseLeft = e.button == 0;
        this.mouseRight = e.button == 2;
    },

    mouseUpEvent(e) {
        if (
            this.mouseLeft &&
            this.mouseX > 0 &&
            this.mouseX < this.canvas.width &&
            this.mouseY > 0 &&
            this.mouseY < this.canvas.height &&
            (this.game.state == 'menuScreen' ||
                this.game.state == 'gameOverScreen')
        ) {
            this.game.startGame();
        }
        if (e.button == 0) {
            this.mouseLeft = false;
        } else if (e.button == 2) {
            this.mouseRight = false;
        }
    },

    mouseMoveEvent(e) {
        var rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    },
};
