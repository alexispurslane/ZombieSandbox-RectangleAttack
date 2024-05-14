export default {
    sounds: {
        shotgun: new Audio('assets/sounds/shotgun.mp3'),
        thump: new Audio('assets/sounds/thump.mp3'),
        jump: new Audio('assets/sounds/jump.mp3'),
        explosion: new Audio('assets/sounds/explosion.mp3'),
        watersplash: new Audio('assets/sounds/water-splash.mp3'),
        leafcrunch: new Audio('assets/sounds/leaf-crunch.mp3'),
        bubbles: new Audio('assets/sounds/bubbles.mp3'),
    },

    init(game) {},

    enterFrame() {},

    /**
     * Play a sound effect. Restart the sound effect if it's already playing for maximum responsiveness
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
     * Play a sound all the way through. If it's already playing, do nothing.
     */
    playThrough(sound) {
        if (!(sound in this.sounds)) {
            console.warn('Played unknown sound: ', sound);
            return;
        }
        this.sounds[sound].play();
    },
};
