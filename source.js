function save(game) {
    sessionStorage.setItem("grid", JSON.stringify(game.gridHandler.list));
    sessionStorage.setItem("water", JSON.stringify(game.gridHandler.waterList));
    sessionStorage.setItem("width", game.levelWidth);
    sessionStorage.setItem("height", game.levelHeight);
    sessionStorage.setItem("horizon", game.horizon);
}

function discard() {
    sessionStorage.removeItem("grid");
    sessionStorage.removeItem("water");
    sessionStorage.removeItem("width");
    sessionStorage.removeItem("height");
    sessionStorage.removeItem("horizon");
}

function load(game) {
    let g = sessionStorage.getItem("grid");
    let w = sessionStorage.getItem("water");
    let x = sessionStorage.getItem("width");
    let y = sessionStorage.getItem("height");
    let h = sessionStorage.getItem("horizon");

    if (g && w && x && y && h) {
        g = JSON.parse(g);
        w = JSON.parse(w);
        x = JSON.parse(x);
        y = JSON.parse(y);
        h = JSON.parse(h);
        if (Array.isArray(g) && Array.isArray(w)
            && Number.isInteger(x) && Number.isInteger(y)
            && Number.isInteger(h)) {
            game.gridHandler.list = g;
            for (let x = 0; x < game.gridHandler.list.length; x++) {
                for (let y = 0; y < game.gridHandler.list[0].length; y++) {
                    if (game.gridHandler.list[x][y] == game.blockInt.fire) {
                        game.gridHandler.list[x][y] = game.blockInt.wood;
                    }
                }
            }
            game.gridHandler.waterList = w;
            game.levelWidth = x;
            game.levelHeight = y;
            game.horizon = h;
            return true;
        }
        return false;
    }
    return false;
}

window.onload = function () {
    window.game = new Game();
};

class Game {
    constructor() {
        this.blockSize = 32;
        this.levelWidth = 900;
        this.levelHeight = 120;
        this.horizon = this.levelHeight / 2 | 0;

        this.fontFamily = 'Arial,sans-serif';

        this.time = 0;
        this.days = 0;
        this.timeIncrement = 0;
        this.dayLength = 490 * 60;

        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');

        let grd = this.context.createLinearGradient(0,0,170,0);
        grd.addColorStop(0,"#807E79");
        grd.addColorStop(1,"white");
        let blocks = {
            bedrock: '#363532',
            fire: 'rgba(255, 0, 0, 0.7)',
            stone: '#807E79',
            iron: grd,
            power_iron: 'rgba(255, 0, 0, 0.7)',
            wood: '#9F763B',
            platform: '#9F763B',
            dirt: '#AE9A73',
            water: 'rgba(0,72,151,0.5)',
            cloud: 'rgba(255,255,255,0.7)'
        };
        this.blockInt = {};
        this.blockColor = [];
        Object.keys(blocks).forEach((block, i) => {
            this.blockInt[block] = i;
            this.blockColor[i] = blocks[block];
        });
        this.blockCombinations = {
            //stone,wood,dirt
            "2,0,0": this.blockInt.iron,
            "1,0,1": this.blockInt.wood,
            "0,1,1": this.blockInt.platform
        };
        this.state = 'loading';

        this.handlers = ['control', 'render',
                         'player', 'enemy',
                         'dust', 'blood',
                         'shot', 'view'];
        this.handlers.forEach((handler) => {
            let handlerName = handler + 'Handler';
            let className = handlerName.charAt(0)
                .toUpperCase() + handlerName.slice(1);
            this[handlerName] = new window[className](this);
        });
        this.gridHandler = new GridHandler(this);

        setInterval(this.enterFrame.bind(this), 1000/60);
        drawMenuScreen(this);
    }
    startGame() {
        this.gridHandler.init(this);
        if (!load(this)) {
            this.levelWidth = 900;
            this.levelHeight = 120;
            this.horizon = this.levelHeight / 2 | 0;
            createLevel(this);
        }
        this.handlers.forEach((h) => this[h+'Handler'].init(this));
        this.handlers.push('grid');

        this.state = 'game';
        this.time = this.dayLength * 0.37;
    }
    enterFrame() {
        if (this.state != 'game') return;
        if (this.playerHandler.hp <= 0) {
            this.state = 'gameOverScreen';
            drawGameOverScreen(this);
            return;
        }
        this.time++;
        if (this.time > this.dayLength) {
            this.time = 0;
            this.days++;
        }
        this.handlers.forEach((h) => this[h+'Handler'].enterFrame());
    }
}
window.Game = Game;

class ControlHandler {
    constructor (game) {
        this.a = false;
        this.d = false;
        this.s = false;
        this.space = false;
        this.mouseLeft = false;
        this.mouseRight = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.game = game;
        this.canvas = game.canvas;
        window.addEventListener('keydown', this.keyDownEvent.bind(this));
        window.addEventListener('keyup', this.keyUpEvent.bind(this));
        window.addEventListener('mousedown', this.mouseDownEvent.bind(this));
        window.addEventListener('mouseup', this.mouseUpEvent.bind(this));
        window.addEventListener('mousemove', this.mouseMoveEvent.bind(this));
        document.getElementById('canvas')
            .addEventListener('contextmenu',
                              (e) => {
                                  if (e.button == 2) {
                                      e.preventDefault();
                                      return false;
                                  }
                              });
    }

    init(game) {
        this.playerHandler = game.playerHandler;
    }
    enterFrame(){}
    keyDownEvent(e) {
        if (e.keyCode == 32) {
            this.space = true;
        } else if (e.keyCode == 65 || e.keyCode == 37) {
            this.a = true;
        } else if (e.keyCode == 68 || e.keyCode == 39) {
            this.d = true;
        } else if ((e.keyCode >= 48 || e.keyCode <= 57)
                   && this.game.state == 'game') {
            this.playerHandler.hotKey(e.keyCode);
        }
        if (this.mouseX > 0 && this.mouseX < this.canvas.width && this.mouseY >
            0 && this.mouseY < this.canvas.height) {
            e.preventDefault();
            return false;
        }
    }
    keyUpEvent(e) {
        if (e.keyCode == 32) {
            this.space = false;
        } else if (e.keyCode == 65) {
            this.a = false;
        } else if (e.ctrlKey && e.keyCode == 68) {
            if (confirm("Are you sure you want to discard all saved states?")) {
                discard(window.game);
            }
        } else if (e.keyCode == 68) {
            this.d = false;
        } else if (e.ctrlKey && e.keyCode == 83) {
            save(window.game);
            alert("Game world succesfully saved.");
        } else if (e.keyCode == 83) {
            this.playerHandler.wheel(-100);
        } else if (e.keyCode == 87) {
            this.playerHandler.wheel(100);
        } else if (e.metaKey && e.keyCode == 75) {
            save();
        } else if (e.metaKey && e.keyCode == 82) {
            discard();
        }
        if (this.mouseX > 0
            && this.mouseX < this.canvas.width
            && this.mouseY > 0
            && this.mouseY < this.canvas.height) {
            e.preventDefault();
            return false;
        }
    }
    mouseDownEvent(e) {
        this.mouseLeft = e.button == 0;
        this.mouseRight = e.button == 2;
    }
    mouseUpEvent(e) {
        if (this.mouseLeft
            && this.mouseX > 0
            && this.mouseX < this.canvas.width
            && this.mouseY > 0
            && this.mouseY < this.canvas.height
            && (this.game.state == 'menuScreen'
                || this.game.state == 'gameOverScreen')) {
            this.game.startGame();
        }
        if (e.button == 0) {
            this.mouseLeft = false;
        } else if (e.button == 2) {
            this.mouseRight = false;
        }
    }
    mouseMoveEvent(e) {
        let rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }
}
window.ControlHandler = ControlHandler;

class GridHandler {
    init(game) {
        this.blockSize = game.blockSize;
        this.blockInt = game.blockInt;
        this.levelWidth = game.levelWidth;
        this.levelHeight = game.levelHeight;
        this.list = [];
        this.waterList = [];
        this.toggle = 0;
        for (let i = 0; i < this.levelWidth; i++) {
            this.list[i] = [];
            for (let j = 0; j < this.levelHeight; j++) {
                this.list[i][j] = false;
            }
        }
    }
    enterFrame() {
        let list = this.list;
        let levelWidth = this.levelWidth;
        let levelHeight = this.levelHeight;
        let toggle = this.toggle;
        for (let i = this.waterList.length - 1; i >= 0; i--) {
            toggle++;
            if (toggle > 9) {
                toggle = 0;
            }
            if (toggle != 0) {
                continue;
            }
            let water = this.waterList[i];
            if (list[water.x][water.y] != this.blockInt.water) {
                this.waterList.splice(i, 1);
                continue;
            }
            if (water.y < levelHeight && list[water.x][water.y + 1] === false) {
                list[water.x][water.y + 1] = this.blockInt.water;
                this.waterList[this.waterList.length] = {
                    x: water.x,
                    y: water.y + 1
                };
                continue;
            }
            if (water.x > 0 && list[water.x - 1][water.y] === false) {
                list[water.x - 1][water.y] = this.blockInt.water;
                this.waterList[this.waterList.length] = {
                    x: water.x - 1,
                    y: water.y
                };
                continue;
            }
            if (water.x < levelWidth - 1 && list[water.x + 1][water.y] ===
                false) {
                list[water.x + 1][water.y] = this.blockInt.water;
                this.waterList[this.waterList.length] = {
                    x: water.x + 1,
                    y: water.y
                };
                continue;
            }
        }
        this.toggle++;
        if (this.toggle > 9) {
            this.toggle = 0;
        }
    }
}
window.GridHandler = GridHandler;

class RenderHandler {
    constructor(game) {
        this.sunMoonArcRadius = game.canvas.height - 40;
        this.game = game;
        this.canvas = game.canvas;
        this.context = game.context;
        this.blockSize = game.blockSize;
        this.blockColor = game.blockColor;
        this.blockInt = game.blockInt;
        this.levelWidth = game.levelWidth;
        this.levelHeight = game.levelHeight;
        this.horizon = game.horizon;
        this.timeRatio = Math.PI * 2 / game.dayLength;
        this.lights = [];
    }
    init(game) {
        this.gridHandler = game.gridHandler;
        this.controlHandler = game.controlHandler;
        this.viewHandler = game.viewHandler;
        this.shotHandler = game.shotHandler;
        this.dustHandler = game.dustHandler;
        this.bloodHandler = game.bloodHandler;
        this.enemyHandler = game.enemyHandler;
        this.player = game.playerHandler;
        this.lights = [];
    }
    enterFrame() {
        let context = this.context;
        let gridList = this.gridHandler.list;
        let blockSize = this.blockSize;
        let blockHalf = blockSize / 2;
        let blockColor = this.blockColor;
        let blockInt = this.blockInt;
        let horizon = this.horizon;
        let player = this.player;
        let pX = player.x;
        let pY = player.y;
        let obj, X, Y, i, j, depth, dist;
        dist = this.game.time * this.timeRatio;
        i = Math.sin(dist);
        j = Math.cos(dist);

        // Sky
        let gradient = context.createLinearGradient(0, 0, 0, this.canvas.height);
        depth = this.viewHandler.y / (this.levelHeight * blockSize) * 250 | 0;
        dist = (j + 1) * 75 | 0;
        gradient.addColorStop(0, 'rgb(' + (77 + depth) + ',' + (117 + depth) +
                              ',' + (179 + depth) + ')');
        gradient.addColorStop(1, 'rgb(' + (127 + depth - dist) + ',' + (167 +
                                                                        depth - dist) + ',' + (228 + depth - dist) + ')');
        context.fillStyle = gradient;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Sun and Moon
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

        // Map
        let offsetX = this.canvas.width * 0.5 - this.viewHandler.x;
        let offsetY = this.canvas.height * 0.5 - this.viewHandler.y;
        context.fillStyle = '#776655';
        Y = Math.round(horizon * blockSize + offsetY);
        context.fillRect(0, Y, this.canvas.width, this.canvas.height - Y);
        let startX = Math.max(-offsetX / blockSize | 0, 0);
        let endX = Math.min(startX + Math.ceil(this.canvas.width / blockSize) +
                            1, this.levelWidth);
        let startY = Math.max(-offsetY / blockSize | 0, 0);
        let endY = Math.min(startY + Math.ceil(this.canvas.height / blockSize) +
                            1, this.levelHeight);
        for (i = startX; i < endX; i++) {
            depth = 0;
            for (j = startY; j < endY; j++) {
                obj = gridList[i][j];
                if (obj !== false && obj != blockInt.water && obj != blockInt.cloud) {
                    X = Math.round(i * blockSize + offsetX);
                    Y = Math.round(j * blockSize + offsetY);
                    if (obj == blockInt.platform) {
                        context.fillStyle = blockColor[obj];
                        context.fillRect(X, Y, blockSize, blockSize * 0.25);
                        context.fillRect(X, Y + blockSize * 0.5, blockSize,
                                         blockSize * 0.25);
                    } else {
                        context.fillStyle = blockColor[obj];
                        context.fillRect(X, Y, blockSize, blockSize);
                    }
                }
                if (obj === false && j == horizon && gridList[i][j-1] === false) {
                    X = Math.round(i * blockSize + offsetX);
                    Y = Math.round(j * blockSize + offsetY);
                    context.fillStyle = 'rbga(0,0,0,0.2)';
                    context.fillRect(X + 1, Y, 2, 2);
                    context.fillRect(X + 5, Y, 3, 3);
                    context.fillRect(X + 11, Y, 2, 2);
                }

                // Shadows
                if (obj != blockInt.bedrock && obj != blockInt.cloud
                    && obj != false || j >= horizon) {
                    X = i * blockSize;
                    Y = j * blockSize;
                    let dists = this.lights.map((l) =>
                                                Math.pow(l.x-X-blockHalf,2)+
                                                Math.pow(l.x-Y-blockHalf,2));
                    dists.push(Math.pow(pX-X - blockHalf,2) + Math.pow(pY-Y - blockHalf,2));
                    dist = Math.min(...dists);
                    X = Math.round(X + offsetX);
                    Y = Math.round(Y + offsetY);
                    context.fillStyle = 'rgba(0,0,0,' +
                        (depth * 0.05 * Math.max(Math.min(dist / 16000, 1), 0.4)) + ')';
                    context.fillRect(X, Y, blockSize, blockSize);
                    if (obj == blockInt.platform) {
                        depth += 0.2;
                    } else if (obj == blockInt.water) {
                        depth += 0.5;
                    } else if (obj == blockInt.fire) {
                        // depth stays the same!
                    } else {
                        depth += 1;
                    }
                }
            }
        }

        // Player
        X = Math.round(pX + offsetX - player.width / 2);
        Y = Math.round(pY + offsetY - player.height / 2);
        context.fillStyle = '#333333';
        context.fillRect(X, Y, player.width, player.height);

        //Enemies
        context.fillStyle = '#774444';
        this.enemyHandler.list.forEach((obj) => {
            context.fillRect(Math.round(obj.x + offsetX - obj.width * 0.5),
                             Math.round(obj.y + offsetY - obj.height * 0.5), obj.width,
                             obj.height);
        });

        // Particles
        context.fillStyle = '#333333';
        this.shotHandler.list.forEach((obj) => {
            dist = this.shotHandler.size;
            context.fillRect(Math.round(obj.x + offsetX - dist / 2),
                             Math.round(obj.y + offsetY - dist / 2),
                             dist, dist);
        });
        context.fillStyle = '#555555';
        this.dustHandler.list.forEach((obj) => {
            dist = this.dustHandler.size * (obj.hp / this.dustHandler.startHp);
            context.fillRect(Math.round(obj.x + offsetX - dist * 0.5),
                             Math.round(obj.y + offsetY - dist * 0.5),
                             dist, dist);
        });
        context.fillStyle = '#32BF32';
        this.bloodHandler.list.forEach((obj) => {
            dist = this.bloodHandler.size * (obj.hp / this.bloodHandler.startHp);
            context.fillRect(Math.round(obj.x + offsetX - dist * 0.5),
                             Math.round(obj.y + offsetY - dist * 0.5),
                             dist, dist);
        });

        // Grass, stones
        for (i = startX; i < endX; i++) {
            for (j = startY; j < endY; j++) {
                obj = gridList[i][j];
                if (obj == blockInt.dirt && j <= horizon
                    && (gridList[i][j - 1] === false
                        || gridList[i][j - 1] == blockInt.cloud)) {
                    X = Math.round(i * blockSize + offsetX);
                    Y = Math.round(j * blockSize + offsetY);
                    context.fillStyle = 'rgba(45,130,45,0.75)';
                    context.fillRect(X, Y - 3, blockSize, 3);
                    context.fillRect(X + 1, Y - 5, 2, 2);
                    context.fillRect(X + 5, Y - 5, 3, 2);
                    context.fillRect(X + 11, Y - 5, 2, 2);
                }
                if (obj == blockInt.water || obj == blockInt.cloud) {
                    X = Math.round(i * blockSize + offsetX);
                    Y = Math.round(j * blockSize + offsetY);
                    context.fillStyle = blockColor[obj];
                    context.fillRect(X, Y, blockSize, blockSize);
                }
                if (obj == blockInt.water && j <= horizon && (gridList[i][j - 1] ===
                                                              false || gridList[i][j - 1] == blockInt.cloud)) {
                    context.fillStyle = 'rgba(255,255,255,0.2)';
                    context.fillRect(X, Y, blockSize, 6);
                    context.fillRect(X, Y, blockSize / 2, 3);
                }
            }
        }

        // Nightfall
        depth = Math.min(Math.cos(this.game.time * this.timeRatio) + 0.3, 0.5);
        if (depth > 0) {
            context.fillStyle = 'rgba(0,0,0,' + depth + ')';
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.lights.forEach((l) => {
            let sX = Math.max((l.x - 250)/this.blockSize|0, 0);
            let eX = Math.min((l.x + 250)/this.blockSize|0, this.levelWidth);

            let sY = Math.max((l.y - 250)/this.blockSize|0, 0);
            let eY = Math.min((l.y + 250)/this.blockSize|0, this.levelHeight);

            for (let x = sX; x < eX; x++) {
                for (let y = sY; y < eY; y++) {
                    let obj = gridList[x][y];
                    if (obj !== false && obj != blockInt.water && obj != blockInt.cloud) {
                        let X = Math.round(x * blockSize + offsetX);
                        let Y = Math.round(y * blockSize + offsetY);
                        if (obj == blockInt.platform) {
                            context.fillStyle = blockColor[obj];
                            context.fillRect(X, Y, blockSize, blockSize * 0.25);
                            context.fillRect(X, Y + blockSize * 0.5, blockSize,
                                             blockSize * 0.25);
                        } else {
                            context.fillStyle = blockColor[obj];
                            context.fillRect(X, Y, blockSize, blockSize);
                        }
                    }
                }
            }
        });

        // Cursor
        if (player.actionObject.count < 0 && player.canBuild) {
            context.fillStyle = 'rgba(0,0,0,0.2)';
            context.fillRect(
                ((this.controlHandler.mouseX-offsetX)/blockSize | 0)*blockSize + offsetX,
                ((this.controlHandler.mouseY-offsetY)/blockSize | 0)*blockSize + offsetY,
                blockSize, blockSize);
        }


        // Heads up Display/Layover Interface
        context.fillStyle = '#444444';
        context.fillRect(0, 0, this.canvas.width, 20);
        context.textAlign = 'left';
        context.font = 'bold 11px/1 Arial';
        context.fillStyle = '#AAAAAA';
        context.fillText('H', 5, 10);
        context.fillText('K', 85, 10);
        context.font = 'bold 15px/1 Arial';
        context.fillStyle = '#DDDDDD';
        context.fillText(Math.round(player.hp), 15, 10);
        context.fillText(Math.round(player.kills), 95, 10);
        if (player.reload >= 0) {
            context.fillStyle = "red";
        } else if (player.reload <= -180) {
            context.fillStyle = "green";
        } else {
            context.fillStyle = "blue";
        }
        context.fillRect(this.canvas.width-5, 25, Math.max(player.reload, -this.canvas.width+5), 15);
        let cf = context.fillStyle;
        context.textAlign = 'right';
        player.actions.forEach((x,i) => {
            context.font = 'bold 16px/1 Arial';
            if (i == player.action) {
                context.fillStyle = 'orange';
            } else {
                context.fillStyle = cf;
            }
            let str = x.name;
            if (x.type) { str += " x"+player.inventory[x.type]; }
            context.fillText(str, this.canvas.width-5, (i+1)*16+33);
        });
    };
}
window.RenderHandler = RenderHandler;

class PlayerHandler {
    constructor(game) {
        this.accel = 0.3;
        this.speed = 2.5;
        this.inventory = {};
        this.inventory[game.blockInt.platform] = 300;
        this.inventory[game.blockInt.wood] = 300;
        Object.values(game.blockInt).forEach((int) => this.inventory[int] = this.inventory[int] || 15);
        this.fallSpeed = 8.0;
        this.width = 40;
        this.height = 50;
        this.startHp = 100;
        this.regen = 0.01;
        this.jumpHeight = 14.0;
        this.jumpDelay = 4.0;
        this.actions = [{
            name: 'Shotgun',
            reload: 25,
            count: 4,
            speed: 7,
            hp: 180,
            modY: 0.01,
            explode: 0,
            spread: 0.7,
            damage: 1,
            destroy: [game.blockInt.dirt]
        }, {
            name: 'Rifle',
            reload: 50,
            count: 1,
            speed: 40,
            hp: 80,
            modY: 0.01,
            explode: 0,
            spread: 0.5,
            damage: 5,
            destroy: []
        }, {
            name: 'Grenade',
            reload: 45,
            count: 1,
            speed: 5,
            hp: 360,
            modY: 0.1,
            explode: 1,
            spread: 0.5,
            damage: 2,
            destroy: [game.blockInt.dirt, game.blockInt.wood]
        }, {
            name: 'Flamethrower',
            reload: 1,
            flammable: true,
            count: 1,
            speed: 7,
            hp: 45,
            modY: -0.1,
            explode: 0,
            spread: 1.5,
            damage: 0.15,
            destroy: []
        }, {
            name: 'Highyeild Bomb',
            reload: 170,
            count: 1,
            speed: 4.5,
            hp: 1000,
            modY: 1,
            explode: 3,
            spread: 1,
            damage: 20,
            destroy: [game.blockInt.wood, game.blockInt.dirt, game.blockInt.stone]
        }, {
            name: 'Rocket Launcher',
            reload: 87,
            count: 4,
            speed: 8,
            hp: 240,
            modY: 0.01,
            explode: 2,
            spread: 2,
            damage: 2,
            destroy: [game.blockInt.wood, game.blockInt.dirt, game.blockInt.stone]
        }, {
            name: 'Build Dirt',
            reload: 4,
            count: -1,
            type: game.blockInt.dirt
        }, {
            name: 'Build Stone',
            reload: 10,
            count: -1,
            type: game.blockInt.stone
        }, {
            name: 'Build Wood',
            reload: 6,
            count: -1,
            type: game.blockInt.wood
        }, {
            name: 'Build Platform',
            reload: 3,
            count: -1,
            type: game.blockInt.platform
        }, {
            name: 'Remove Block',
            reload: 29,
            count: -2
        }];
        this.kills = 0;
        this.action = null;
        this.actionObject = null;
        this.canBuild = false;
    }
    init(game) {
        this.blockSize = game.blockSize;
        this.blockInt = game.blockInt;
        this.controlHandler = game.controlHandler;
        this.gridHandler = game.gridHandler;
        this.levelWidth = game.levelWidth;
        this.levelHeight = game.levelHeight;
        this.halfWidth = game.canvas.width / 2;
        this.halfHeight = game.canvas.height / 2;
        this.horizon = game.horizon;

        this.shoot = game.shotHandler.create.bind(game.shotHandler);
        this.viewHandler = game.viewHandler;
        this.enemyHandler = game.enemyHandler;

        this.x = game.levelWidth * game.blockSize * 0.5;
        this.y = this.height * 10;
        this.vX = 0;
        this.vY = 20;

        this.reload = 0;
        this.canJump = 0;
        this.inWater = false;
        this.spaceDown = false;

        this.blockDifficulty = {};
        let bi = Object.values(game.blockInt);
        bi.forEach((k,i) => this.blockDifficulty[k] = (bi.length-i)*5);

        this.hp = this.startHp;
        this.kills = 0;
        this.action = 0;
        this.canBuild = false;
        this.actionObject = this.actions[this.action];
    }
    enterFrame() {
        let controlHandler = this.controlHandler;
        let accel = this.accel;
        let speed = this.speed;
        let blockSize = this.blockSize;
        let blockInt = this.blockInt;
        let gridList = this.gridHandler.list;
        let width = this.width;
        let height = this.height;
        let i, j;
        if (this.hp < this.startHp) {
            this.hp += this.regen;
            if (this.hp > this.startHp) {
                this.hp = this.startHp;
            }
        }
        if (this.underWater) { this.hp -= 0.02; }
        if (this.canJump < 1 && controlHandler.space && this.spaceDown == false) {
            this.vY = -this.jumpHeight;
            this.spaceDown = true;
        }
        if (controlHandler.space == false && this.spaceDown) {
            this.spaceDown = false;
        }
        if (controlHandler.a) {
            this.vX -= accel;
            if (this.vX < -speed) {
                this.vX = -speed;
            }
        } else if (controlHandler.d) {
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
        let newX = this.x + this.vX;
        let startX = Math.max((newX - width * 0.5) / blockSize | 0, 0);
        let startY = Math.max((this.y - height * 0.5) / blockSize | 0, 0);
        let endX = Math.min((newX + width * 0.5 - 1) / blockSize | 0, this.levelWidth -
                            1);
        let endY = Math.min((this.y + height * 0.5) / blockSize | 0, this.levelHeight -
                            1);
        this.underWater = true;
        for (i = startX; i <= endX; i++) {
            for (j = startY; j <= endY; j++) {
                if (gridList[i][j] !== false && gridList[i][j] != blockInt.cloud &&
                    gridList[i][j] != blockInt.platform) {
                    if (gridList[i][j] == blockInt.water) {
                        this.inWater = true;
                        if (this.vX > speed * 0.5) {
                            this.vX = speed * 0.5;
                        } else if (this.vX < -speed * 0.5) {
                            this.vX = -speed * 0.5;
                        }
                    } else {
                        if (newX < i * blockSize) {
                            newX = i * blockSize - width * 0.5;
                        } else {
                            newX = i * blockSize + blockSize + width * 0.5;
                        }
                        this.vX = 0;
                    }
                }
                this.underWater = this.underWater &&
                    (gridList[i][j] != false && gridList[i][j] != blockInt.cloud);
            }
        }
        this.x = newX;
        let newY;
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
        let collide = false;
        this.inWater = false;
        startX = Math.max((this.x - width * 0.5) / blockSize | 0, 0);
        startY = Math.max((newY - height * 0.5) / blockSize | 0, 0);
        endX = Math.min((this.x + width * 0.5 - 1) / blockSize | 0, this.levelWidth -
                        1);
        endY = Math.min((newY + height * 0.5) / blockSize | 0, this.levelHeight -
                        1);
        for (i = startX; i <= endX; i++) {
            for (j = startY; j <= endY; j++) {
                if (gridList[i][j] !== false && gridList[i][j] != blockInt.cloud &&
                    gridList[i][j] != blockInt.platform) {
                    collide = true;
                    if (gridList[i][j] == blockInt.water) {
                        this.inWater = true;
                        this.canJump--;
                    } else {
                        if (newY < j * blockSize) {
                            newY = j * blockSize - height * 0.5 - 0.001;
                            this.canJump--;
                        } else {
                            newY = j * blockSize + blockSize + height * 0.5;
                        }
                        this.vY = 0;
                    }
                }
                if (gridList[i][j] == blockInt.platform && this.vY > 0) {
                    if (this.y + height * 0.5 < j * blockSize) {
                        newY = j * blockSize - height * 0.5 - 0.001;
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
            let offsetX = this.viewHandler.x - this.halfWidth;
            let offsetY = this.viewHandler.y - this.halfHeight;
            let X = controlHandler.mouseX + offsetX;
            let Y = controlHandler.mouseY + offsetY;
            let dist = Math.sqrt(Math.pow(this.x - X,2) + Math.pow(this.y - Y,2));
            if (dist < 250) {
                this.canBuild = true;
                if (this.reload <= 0 && controlHandler.mouseLeft) {
                    X = X / blockSize | 0;
                    Y = Y / blockSize | 0;
                    if (X > 0 && X < this.levelWidth && Y > 0 && Y < this.levelHeight) {
                        if (this.actionObject.count == -1) {
                            if (gridList[X][Y] == false ||
                                gridList[X][Y] == blockInt.water ||
                                gridList[X][Y] == blockInt.cloud) {
                                collide = false;
                                let enemy;
                                for (let i = this.enemyHandler.list.length - 1; i >= 0; i--) {
                                    enemy = this.enemyHandler.list[i];
                                    if (enemy.x + enemy.width*0.5 > X*blockSize &&
                                        enemy.x - enemy.width*0.5 < X*blockSize + blockSize &
                                        enemy .y + enemy.height*0.5 > Y*blockSize &&
                                        enemy.y - enemy.height*0.5 < Y*blockSize + blockSize) {
                                        collide = true;
                                        break;
                                    }
                                }
                                if (this.x + this.width*0.5 > X*blockSize &&
                                    this.x - this.width*0.5 < X*blockSize + blockSize &
                                    this.y + this.height*0.5 > Y*blockSize
                                    && this.y - this.height*0.5 < Y*blockSize + blockSize) {
                                    collide = true;
                                }
                                if (collide == false && this.inventory[this.actionObject.type] > 0) {
                                    gridList[X][Y] = this.actionObject.type;
                                    this.inventory[this.actionObject.type]--;
                                }
                            }
                        }
                        if (this.actionObject.count == -2) {
                            if (gridList[X][Y] != blockInt.bedrock) {
                                let block = gridList[X][Y];
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
            if (this.reload <= 0 && controlHandler.mouseLeft) {
                let offsetX = this.viewHandler.x - this.halfWidth;
                let offsetY = this.viewHandler.y - this.halfHeight;
                for (let i = this.actionObject.count - 1; i >= 0; i--) {
                    this.shoot(this.x, this.y - 4, controlHandler.mouseX +
                               offsetX, controlHandler.mouseY + offsetY, this.actionObject);
                }
                this.reload = this.actionObject.reload;
            }
        }
    }
    hotKey(keyCode) {
        if (keyCode == 48) { keyCode = 58; }
        if (keyCode - 49 in this.actions) {
            this.action = keyCode - 49;
            this.actionObject = this.actions[this.action];
            this.reload = this.actions[this.action].reload;
        }
    }
    wheel(delta) {
        if (delta > 0) {
            if (this.action <= 0) {
                this.action = this.actions.length - 1;
            } else {
                this.action--;
            }
        } else {
            if (this.action >= this.actions.length - 1) {
                this.action = 0;
            } else {
                this.action++;
            }
        }
        this.actionObject = this.actions[this.action];
        this.reload = this.actions[this.action].reload;
    }
}
window.PlayerHandler = PlayerHandler;

class EnemyHandler {
    constructor(game) {
        this.startAccel = 0.01;
        this.startSpeed = 0.25;
        this.fallSpeed = 4.0;
        this.startWidth = 36;
        this.startHeight = 46;
        this.jumpHeight = 12.0;
        this.jumpDelay = 12.0;
        this.startHp = 8;
        this.spawnRate = 0.01;
        this.list = [];
        this.pool = [];
    }
    init(game) {
        this.list.length = 0;
        this.game = game;
        this.playerHandler = game.playerHandler;
        this.blockSize = game.blockSize;
        this.blockInt = game.blockInt;
        this.gridList = game.gridHandler.list;
        this.blood = game.bloodHandler.create.bind(game.bloodHandler);
        this.levelWidth = game.levelWidth;
        this.levelHeight = game.levelHeight;
    }
    enterFrame() {
        let player = this.playerHandler;
        let blockSize = this.blockSize;
        let blockInt = this.blockInt;
        let gridList = this.gridList;
        let enemy, i, j, startX, startY, endX, endY, newX, newY, collide;
        i = this.game.time / this.game.dayLength;
        if ((i < 0.25 || i > 0.75) && Math.random() < this.spawnRate) {
            this.create();
        }
        for (let k = this.list.length - 1; k >= 0; k--) {
            enemy = this.list[k];
            if (enemy.hp <= 0) {
                this.pool[this.pool.length] = enemy;
                this.list.splice(k, 1);
                this.blood(enemy.x, enemy.y, 0, 0, 15);
                this.playerHandler.kills++;
                continue;
            }
            if (enemy.inWater && enemy.y > player.y) {
                enemy.willJump = true;
            }
            if (enemy.canJump < 1 && enemy.willJump) {
                enemy.vY = -this.jumpHeight;
                enemy.willJump = false;
            }
            let daytime = i >= 0.25 && i <= 0.75;
            if ((player.x < enemy.x && !daytime) || (player.x > enemy.x && daytime)) {
                enemy.vX -= enemy.accel;
                if (enemy.vX > enemy.speed) {
                    enemy.vX = enemy.speed;
                }
            } else if ((player.x > enemy.x && !daytime) || (player.x < enemy.x && daytime)) {
                enemy.vX += enemy.accel;
                if (enemy.vX < -enemy.speed) {
                    enemy.vX = -enemy.speed;
                }
            }
            if (enemy.underWater) enemy.hp -= 0.1;

            newX = enemy.x + enemy.vX;
            newY = enemy.y + enemy.vY;

            startX = Math.max((newX - enemy.width / 2) / blockSize | 0, 0);
            startY = Math.max((enemy.y - enemy.height / 2) / blockSize | 0, 0);

            endX = Math.min((newX + enemy.width / 2 - 1) / blockSize | 0, this.levelWidth - 1);
            endY = Math.min((enemy.y + enemy.height / 2) / blockSize | 0, this.levelHeight - 1);
            for (i = startX; i <= endX; i++) {
                for (j = startY; j <= endY; j++) {
                    if (gridList[i][j] !== false && gridList[i][j] != blockInt.cloud &&
                        gridList[i][j] != blockInt.platform) {
                        if (gridList[i][j] == blockInt.water) {
                            enemy.inWater = true;
                            if (enemy.vX > enemy.speed / 2) {
                                enemy.vX = enemy.speed / 2;
                            } else if (enemy.vX < -enemy.speed / 2) {
                                enemy.vX = -enemy.speed / 2;
                            }
                        } else {
                            if (newX < i * blockSize) {
                                newX = i * blockSize - enemy.width / 2;
                            } else {
                                newX = i * blockSize + blockSize + enemy.width / 2;
                            }
                            enemy.vX = 0;
                            enemy.willJump = true;
                        }
                    }
                }
            }
            enemy.x = newX;
            enemy.y = newY;

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
            startX = Math.max((enemy.x - enemy.width / 2) / blockSize | 0, 0);
            startY = Math.max((newY - enemy.height / 2) / blockSize | 0, 0);
            endX = Math.min((enemy.x + enemy.width / 2 - 1) / blockSize | 0,
                            this.levelWidth - 1);
            endY = Math.min((newY + enemy.height / 2) / blockSize | 0, this.levelHeight -
                            1);
            for (i = startX; i <= endX; i++) {
                for (j = startY; j <= endY; j++) {
                    if (gridList[i][j] !== false && gridList[i][j] != blockInt.cloud &&
                        gridList[i][j] != blockInt.platform) {
                        collide = true;
                        if (gridList[i][j] == blockInt.water) {
                            enemy.inWater = true;
                            enemy.canJump--;
                        } else {
                            if (newY < j * blockSize) {
                                newY = j * blockSize - enemy.height / 2 - 0.001;
                                enemy.canJump--;
                            } else {
                                newY = j * blockSize + blockSize + enemy.height/2;
                            }
                            enemy.vY = 0;
                        }
                    }
                    if (gridList[i][j] == blockInt.platform && enemy.vY > 0) {
                        if (enemy.y + enemy.height * 0.5 < j * blockSize) {
                            newY = j * blockSize - enemy.height * 0.5 - 0.001;
                            collide = true;
                            enemy.vY = 0;
                            enemy.canJump--;
                        }
                    }
                }
            }

            if (collide == false) {
                enemy.canJump = this.jumpDelay;
            }
            if (enemy.x - enemy.width / 2 < player.x + player.width / 2 &&
                enemy.x + enemy.width / 2 > player.x - player.width / 2 &&
                enemy.y - enemy.height / 2 < player.y + player.height / 2 &&
                enemy.y + enemy.height / 2 > player.y - player.height / 2) {
                this.blood(enemy.x, enemy.y, 0, 0, 5);
                player.hp--;
                player.vX += (player.x - enemy.x) * 0.05;
                player.vY += (player.y - enemy.y) * 0.05;
            }
        }
    }
    create() {
        let enemy = {};
        if (this.pool.length > 0) {
            enemy = this.pool.pop();
        }
        if (this.playerHandler.x < 500
            || (Math.random() < 0.5
                && this.playerHandler .x < this.levelWidth * this.blockSize - 800)) {
            enemy.x = this.playerHandler.x + 1024 + Math.random() * 200;
        } else {
            enemy.x = this.playerHandler.x - 1024 - Math.random() * 200;
        }
        enemy.y = 50;
        enemy.vX = 0;
        enemy.vY = 10;
        enemy.hp = this.startHp;
        enemy.accel = this.startAccel;
        enemy.speed = this.startSpeed;
        enemy.width = this.startWidth;
        enemy.height = this.startHeight;
        enemy.canJump = 0;
        enemy.inWater = false;
        this.list[this.list.length] = enemy;
    };
}
window.EnemyHandler = EnemyHandler;

class ParticleHandler {
    constructor(game) {
        this.list = [];
        this.pool = [];
    }

    init(game) {
        this.list.length = 0;
        this.blockSize = game.blockSize;
        this.blockInt = game.blockInt;
        this.gridList = game.gridHandler.list;
        this.renderHandler = game.renderHandler;
        this.levelWidth = game.levelWidth;
        this.levelHeight = game.levelHeight;
        this.horizon = game.horizon;
    }

    customParticle(a,b) {}

    create(sX, sY, eX, eY, customParam) {
        let max = 1;
        if (Number.isInteger(customParam)) { max = customParam; }
        for (let i = 0; i < max; i++) {
            let particle = {};
            if (this.pool.length > 0) {
                particle = this.pool.pop();
            }
            particle.x = sX;
            particle.y = sY;
            particle.vX = eX - sX;
            particle.vY = eY - sY;
            this.list.push(this.customParticle(particle, customParam));
        }
    }

    enterFrame() {
        // pass
    }
}

class ShotHandler extends ParticleHandler {
    constructor(game) {
        super(game);
        this.size = 5;
        this.actions = [false, {
            name: 'Explode1',
            count: 30,
            speed: 4,
            hp: 15,
            modY: 0,
            explode: 0,
            spread: 0,
            damage: 1,
            destroy: [game.blockInt.dirt]
        }, {
            name: 'Explode2',
            count: 30,
            speed: 4,
            hp: 15,
            modY: 0,
            explode: 0,
            spread: 0,
            damage: 2,
            destroy: [game.blockInt.wood, game.blockInt.dirt]
        },{
            name: 'Explode3',
            count: 120,
            speed: 20,
            hp: 300,
            modY: 0,
            explode: 0,
            spread: 0,
            damage: 10,
            destroy: [game.blockInt.wood, game.blockInt.dirt, game.blockInt.stone]
        }];
    }

    init(game) {
        super.init(game);
        this.enemyHandler = game.enemyHandler;
        this.dust = game.dustHandler.create.bind(game.dustHandler);
        this.blood = game.bloodHandler.create.bind(game.bloodHandler);
    }

    enterFrame() {
        let blockSize = this.blockSize;
        let blockInt = this.blockInt;
        let gridList = this.gridList;
        let levelWidth = this.levelWidth;
        let levelHeight = this.levelHeight;
        let shot, enemy, j, X, Y;
        for (let i = this.list.length - 1; i >= 0; i--) {
            shot = this.list[i];
            shot.x += shot.vX;
            shot.y += shot.vY;
            shot.vY += shot.modY;
            shot.hp--;
            X = shot.x / blockSize | 0;
            Y = shot.y / blockSize | 0;
            if (X >= 0 && X < levelWidth && Y >= 0 && Y < levelHeight) {
                if (gridList[X][Y] == blockInt.water) {
                    shot.x -= shot.vX * 0.5;
                    shot.y -= shot.vY * 0.5;
                } else if (gridList[X][Y] !== false && gridList[X][Y] !=
                           blockInt.cloud && gridList[X][Y] != blockInt.platform
                           && gridList[X][Y] != blockInt.fire) {
                    let g = gridList[X][Y];
                    let stonePenetration = g === blockInt.stone
                        && Math.random() > 0.65 && shot.name === 'Explode3';
                    let woodPenetration = g === blockInt.wood
                        && Math.random() > 0.55 && shot.name === 'Explode2';
                    if ((shot.destroy.indexOf(g) > -1 || stonePenetration)
                        && g != blockInt.bedrock) {
                        gridList[X][Y] = false;
                    }
                    if (shot.flammable && g == blockInt.wood) {
                        if (gridList[X+1][Y] != blockInt.water
                            && gridList[X-1][Y] != blockInt.water) {
                            gridList[X][Y] = blockInt.fire;
                            this.renderHandler.lights.push({ x: X, y: Y });
                        } else {
                            gridList[X][Y] = false;
                        }
                    }
                    shot.hp = -99;
                    this.dust(shot.x - shot.vX, shot.y - shot.vY, shot.vX * 0.2, shot.vY * 0.2, 4);
                }
            }
            for (j = this.enemyHandler.list.length - 1; j >= 0; j--) {
                enemy = this.enemyHandler.list[j];
                if (shot.x + 2 > enemy.x - enemy.width * 0.5 && shot.x - 2 <
                    enemy.x + enemy.width * 0.5 && shot.y + 2 > enemy.y - enemy
                    .height * 0.5 && shot.y - 2 < enemy.y + enemy.height * 0.5) {
                    enemy.hp -= shot.damage;
                    enemy.vX = shot.vX * 0.03;
                    enemy.vY = shot.vY * 0.03;
                    shot.hp = -99;
                    this.blood(shot.x, shot.y, shot.vX * 0.4, shot.vY * 0.4, 4);
                }
            }
            if (shot.hp == -99 && shot.explode > 0) {
                for (j = this.actions[shot.explode].count - 1; j >= 0; j--) {
                    this.create(shot.x, shot.y, shot.x + Math.random() * 10 - 5,
                                shot.y + Math.random() * 10 - 5, this.actions[shot.explode]);
                }
            }
            if (shot.hp <= 0) {
                this.pool[this.pool.length] = shot;
                this.list.splice(i, 1);
                continue;
            }
        }
    }

    customParticle(shot, action) {
        let dist = Math.sqrt(shot.vX * shot.vX + shot.vY * shot.vY);
        shot.vX = shot.vX / dist * action.speed + Math.random() * action.spread *
            2 - action.spread;
        shot.vY = shot.vY / dist * action.speed + Math.random() * action.spread *
            2 - action.spread;
        shot.modY = action.modY;
        shot.hp = action.hp;
        shot.explode = action.explode;
        shot.damage = action.damage;
        shot.flammable = action.flammable;
        shot.name = action.name;
        shot.destroy = action.destroy;

        return shot;
    }
}
window.ShotHandler = ShotHandler;

class DustHandler extends ParticleHandler {
    constructor(game) {
        super(game);
        this.size = 6;
        this.startHp = 30;
    }
    enterFrame() {
        let blockSize = this.blockSize;
        let blockInt = this.blockInt;
        let gridList = this.gridList;
        let levelWidth = this.levelWidth;
        let levelHeight = this.levelHeight;
        let dust, X, Y;
        for (let i = this.list.length - 1; i >= 0; i--) {
            dust = this.list[i];
            dust.x += dust.vX;
            dust.y += dust.vY;
            dust.vY += 0.2;
            dust.hp--;
            X = dust.x / blockSize | 0;
            Y = dust.y / blockSize | 0;
            if (X >= 0 && X < levelWidth && Y >= 0 && Y < levelHeight) {
                if (gridList[X][Y] == blockInt.water) {
                    dust.x -= dust.vX * 0.5;
                    dust.y -= dust.vY * 0.5;
                } else if (gridList[X][Y] !== false && gridList[X][Y] !=
                           blockInt.cloud && gridList[X][Y] != blockInt.platform) {
                    dust.hp *= 0.75;
                }
            }
            if (dust.hp <= 0) {
                this.pool[this.pool.length] = dust;
                this.list.splice(i, 1);
                continue;
            }
        }
    }

    customParticle(dust, count) {
        dust.hp = this.startHp;
        return dust;
    }
}
window.DustHandler = DustHandler;

class BloodHandler extends ParticleHandler {
    constructor(game) {
        super(game);
        this.size = 8;
        this.startHp = 60;
    }

    enterFrame() {
        let blockSize = this.blockSize;
        let blockInt = this.blockInt;
        let gridList = this.gridList;
        let levelWidth = this.levelWidth;
        let levelHeight = this.levelHeight;
        let blood, X, Y;
        for (let i = this.list.length - 1; i >= 0; i--) {
            blood = this.list[i];
            blood.x += blood.vX;
            blood.y += blood.vY;
            blood.vY += 0.2;
            blood.hp--;
            X = blood.x / blockSize | 0;
            Y = blood.y / blockSize | 0;
            if (X >= 0 && X < levelWidth && Y >= 0 && Y < levelHeight) {
                if (gridList[X][Y] == blockInt.water) {
                    blood.x -= blood.vX * 0.5;
                    blood.y -= blood.vY * 0.5;
                } else if (gridList[X][Y] !== false && gridList[X][Y] !=
                           blockInt.cloud && gridList[X][Y] != blockInt.platform) {
                    blood.hp *= 0.75;
                }
            }
            if (blood.hp <= 0) {
                this.pool[this.pool.length] = blood;
                this.list.splice(i, 1);
                continue;
            }
        }
    }

    customParticle(blood, count) {
        blood.hp = this.startHp;
        return blood;
    }
}
window.BloodHandler = BloodHandler;

class ViewHandler {
    constructor(game) {
        this.x = 0;
        this.y = 0;
    }

    init(game) {
        this.x = game.levelWidth * game.blockSize * 0.5;
        this.y = 300;
        this.canvas = game.canvas;
        this.blockSize = game.blockSize;
        this.player = game.playerHandler;
        this.levelWidth = game.levelWidth;
        this.levelHeight = game.levelHeight;
    }

    enterFrame() {
        this.x += (this.player.x - this.x) * 0.05;
        if (this.x < this.player.x + 1 && this.x > this.player.x - 1) {
            this.x = this.player.x;
        }
        this.y += (this.player.y - this.y) * 0.05;
        if (this.y < this.player.y + 1 && this.y > this.player.y - 1) {
            this.y = this.player.y;
        }
        if (this.x < this.canvas.width * 0.5) {
            this.x = this.canvas.width * 0.5;
        } else if (this.x > this.levelWidth * this.blockSize - this.canvas.width *
                   0.5) {
            this.x = this.levelWidth * this.blockSize - this.canvas.width * 0.5;
        }
        if (this.y < this.canvas.height * 0.5) {
            this.y = this.canvas.height * 0.5;
        } else if (this.y > this.levelHeight * this.blockSize - this.canvas.height *
                   0.5) {
            this.y = this.levelHeight * this.blockSize - this.canvas.height * 0.5;
        }
    }
}
window.ViewHandler = ViewHandler;

function createLevel(game) {
    let flatness = Math.random()+0.25;
    let levelWidth = game.levelWidth;
    let levelHeight = game.levelHeight;
    let blockSize = game.blockSize;
    let blockInt = game.blockInt;
    let list = game.gridHandler.list;
    let waterList = game.gridHandler.waterList;
    let horizon = game.horizon;
    let height = horizon;

    for (let x = 0; x < levelWidth/20; x++) {
        let randX = Math.random() * (levelWidth - 20) + 10 | 0;
        let randY = Math.random() * (levelHeight * 0.5 - 20) + 8 | 0;
        for (let y = 0; y < 25; y++) {
            for (let k = 0; k < 9; k++) {
                let X = randX + Math.random()*k*2 - k | 0;
                let Y = randY + Math.random()*k - k/2 | 0;
                list[X][Y] = blockInt.cloud;
            }
        }
    }

    for (let x = 0; x < levelWidth; x++) {
        if (x == 0 || x == levelWidth - 1) {
            for (let y = 0; y < levelHeight; y++) {
                list[x][y] = blockInt.bedrock;
            }
            continue;
        }

        list[x][0] = blockInt.bedrock;
        list[x][levelHeight - 1] = blockInt.bedrock;

        if (height > horizon) {
            for (let y = horizon; y < height; y++) {
                list[x][y] = blockInt.water;
                waterList.push({ x, y });
            }
        }

        for (let y = height; y < levelHeight - 1; y++) {
            if (y > height + Math.random() * 8 + 4) {
                list[x][y] = blockInt.stone;
            } else {
                list[x][y] = blockInt.dirt;
            }
        }
        if (height == horizon) {
            let treeHeight = Math.random()*7+7;
            for (let h=height; h < treeHeight; h++) {
                list[x][h] = blockInt.wood;
            }
        }
        if (Math.random() < flatness) {
            height += (Math.random() * 3 | 0) - 1;
        }
        if (height > horizon && x > levelWidth/2 - 20 && x < levelWidth/2) {
            height--;
        }
        if (height > levelHeight - 1) {
            height--;
        } else if (height < 1) {
            height++;
        }
    }

    for (let x = 0; x < levelWidth / 25; x++) {
        let randX = Math.random()*(levelWidth - 20) + 10 | 0;
        let randY = horizon + Math.random()*(levelHeight*0.5 - 20) + 8 | 0;
        for (let y = 0; y < 25; y++) {
            for (let k = Math.random()*8 | 0; k >= 0; k--) {
                let X = randX + Math.random()*k*2 - k | 0;
                let Y = randY + Math.random()*k - k/2 | 0;
                list[X][Y] = false;
            }
        }
    }
    for (let x = 0; x < levelWidth / 25; x++) {
        let randX = Math.random() * (levelWidth - 20) + 10 | 0;
        let randY = horizon + Math.random()*(levelHeight*0.5-20)+8|0;
        for (let y = 0; y < 25; y++) {
            for (let k = Math.random()*8|0; k >= 0; k--) {
                let X = randX + Math.random()*k*2 - k | 0;
                let Y = randY + Math.random()*k - k/2 | 0;
                list[X][Y] = blockInt.water;
                waterList.push({ x: X, y: Y });
            }
        }
    }
}

function drawGameOverScreen(game) {
    game.state = 'gameOverScreen';
    game.controlHandler.mouseLeft = false;
    game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    let hW = game.canvas.width * 0.5;
    let hH = game.canvas.height * 0.5;
    let dark = 'rgba(0,0,0,0.9)';
    let medium = 'rgba(0,0,0,0.5)';
    let light = 'rgba(0,0,0,0.3)';
    drawText(game.context, 'Platformer 2', 9, 18, 'normal 21px/1 ' + game.fontFamily,
             light, 'left');
    drawText(game.context, 'Game Over!', hW, hH - 70, 'normal 22px/1 ' +
             game.fontFamily, dark);
    drawText(game.context, 'Kills:' + game.playerHandler.kills, hW, hH - 30,
             'normal 16px/1 ' + game.fontFamily, medium);
    drawText(game.context, 'Click to Restart', hW, hH + 10,
             'normal 17px/1 ' + game.fontFamily, dark);
    drawText(game.context, 'www.H3XED.com', 9, game.canvas.height - 14,
             'normal 13px/1 ' + game.fontFamily, light, 'left');
}


function drawMenuScreen(game) {
    game.state = 'menuScreen';
    game.controlHandler.mouseLeft = false;
    game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    let hW = game.canvas.width * 0.5;
    let hH = game.canvas.height * 0.5;
    let dark = 'rgba(0,0,0,0.9)';
    let medium = 'rgba(0,0,0,0.5)';
    let light = 'rgba(0,0,0,0.3)';
    drawText(game.context, 'Click to Start', hW, hH - 70, 'normal 17px/1 ' +
             game.fontFamily, dark);
    drawText(game.context, 'Use "A" and "D" to move and "Space" to jump.',
             hW, hH - 30, 'normal 15px/1 ' + game.fontFamily, medium);
    drawText(game.context,
             'Use arrow keys to change action and left click to perform action.',
             hW, hH - 10, 'normal 15px/1 ' + game.fontFamily, medium);
    drawText(game.context, 'Beware the night!', hW, hH + 30,
             'normal 15px/1 ' + game.fontFamily, medium);
}

function drawText(context, text, x, y, font, style, align, baseline) {
    context.font = typeof font === 'undefined' ? 'normal 16px/1 Arial' :
        font;
    context.fillStyle = typeof style === 'undefined' ? '#000000' : style;
    context.textAlign = typeof align === 'undefined' ? 'center' : align;
    context.textBaseline = typeof baseline === 'undefined' ? 'middle' :
        baseline;
    context.fillText(text, x, y);
}
