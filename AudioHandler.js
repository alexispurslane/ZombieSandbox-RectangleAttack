export default {
    sounds: {
        shotgun: new Audio('assets/sounds/shotgun.mp3'),
        thump: new Audio('assets/sounds/thump.mp3'),
        jump: new Audio('assets/sounds/jump.mp3'),
        explosion: new Audio('assets/sounds/explosion.mp3'),
        watersplash: new Audio('assets/sounds/water-splash.mp3'),
        leafcrunch: new Audio('assets/sounds/leaf-crunch.mp3'),
        bubbles: new Audio('assets/sounds/bubbles.mp3'),
        outofbreath: new Audio('assets/sounds/out-of-breath.mp3'),
    },

    init(game) {},

    enterFrame() {},

    /**
     *
     * Play a sound effect. Restart the sound effect if it's already playing for
     * maximum responsiveness
     */
    playSound(sound) {
        if (!(sound in this.sounds)) {
            console.warn('Played unknown sound: ', sound);
            return;
        }

        if (!this.sounds[sound].paused) {
            this.sounds[sound].currentTime = 0;
        } else {
            this.sounds[sound].play();
        }
    },

    /**
     *
     * Make the given sound effect a loop and play it if it isn't already
     * playing; otherwise do nothing
     */
    playLoop(sound) {
        if (!(sound in this.sounds)) {
            console.warn('Played unknown sound: ', sound);
            return;
        }

        if (this.sounds[sound].paused) {
            this.sounds[sound].loop = true;
            this.sounds[sound].play();
        }
    },

    /**
     *
     * If the given sound effect is playing, pause it, reset it to the
     * beginning, and reset its loop status. Otherwise do nothing.
     */
    stopLoop(sound) {
        if (!(sound in this.sounds)) {
            console.warn('Played unknown sound: ', sound);
            return;
        }

        if (!this.sounds[sound].paused) {
            this.sounds[sound].loop = false;
            this.sounds[sound].pause();
            this.sounds[sound].currentTime = 0;
        }
    },

    toResume: [],

    pauseAll() {
        this.toResume = [];
        for (const sound in this.sounds) {
            if (!this.sounds[sound].paused) {
                this.toResume.push(sound);
                this.sounds[sound].pause();
            }
        }
    },

    resumeAll() {
        for (const sound of this.toResume) {
            this.sounds[sound].play();
        }
    },
};
