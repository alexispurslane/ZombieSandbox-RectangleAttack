import { BLOCK_INTS } from './blocks.js';

/**
 *
 * ### Action format:
 *
 * - name: weapon name, as shown in switcher bar
 *
 * - reload: number of frames it takes for the weapon to be recharged after a
     shot
 *
 * - speed: speed of the bullet
 *
 * - count: number of bullets shot (they fan out in a cone determined by
     `spread`)
 *
 * - `hp`: lifetime (in frames) of the bullet
 *
 * - `modY`: arc of the bullet
 *
 * - `explode`: whether the bullet explodes into multiple bullets on impact, and
     if so, which type of damage does the explosion do
 *
 * - `spread`: what percent of 90 degrees is the firing cone of this weapon
 *
 * - `damage`: amount of damage done by this weapon's bullet
 *
 * - `requiredKills`: amount of kills necessary to unlock this weapon
 *
 * - `destroy`: what types of blocks this weapon's core bullet is allowed to destroy
 *
 * - `sound`: sound effect to play when this weapon is fired
 *
 */

export default [
    {
        name: 'Shotgun',
        reload: 60,
        count: 10,
        speed: 10,
        hp: 180,
        modY: 0.01,
        explode: 0,
        spread: 1.0,
        damage: 0.5,
        requiredKills: 0,
        destroy: [BLOCK_INTS.dirt],
        sound: 'shotgun',
    },
    {
        name: 'Sniper Rifle',
        reload: 50,
        count: 1,
        speed: 75,
        hp: 90,
        modY: 0,
        explode: 0,
        spread: 0,
        damage: 10,
        requiredKills: 150,
        destroy: [],
    },
    {
        name: 'Grenade',
        reload: 70,
        count: 1,
        speed: 5,
        requiredKills: 150,
        hp: 360,
        modY: 0.1,
        explode: 1,
        spread: 0.5,
        damage: 2.5,
        requiredKills: 0,
        destroy: [BLOCK_INTS.dirt, BLOCK_INTS.wood],
    },
    {
        name: 'Flamethrower',
        reload: 1,
        flammable: true,
        count: 1,
        speed: 7,
        hp: 45,
        requiredKills: 400,
        modY: -0.1,
        explode: 0,
        spread: 1.5,
        damage: 0.15,
        destroy: [],
        conditions: function condition(player) {
            return !player.inWater;
        },
    },
    {
        name: 'Highyeild Bomb',
        reload: 150,
        count: 1,
        speed: 4.5,
        hp: 900,
        modY: 1,
        requiredKills: 300,
        explode: 3,
        spread: 1,
        damage: 20,
        destroy: [BLOCK_INTS.wood, BLOCK_INTS.dirt, BLOCK_INTS.stone],
    },
    {
        name: 'Rocket Launcher',
        reload: 87,
        count: 4,
        speed: 8,
        hp: 240,
        modY: 0.01,
        explode: 2,
        requiredKills: 200,
        spread: 2,
        damage: 2,
        conditions: function condition(player) {
            return !player.underWater;
        },
        destroy: [BLOCK_INTS.wood, BLOCK_INTS.dirt, BLOCK_INTS.stone],
    },
    {
        name: 'Build Dirt',
        build: true,
        reload: 4,
        requiredKills: 0,
        type: BLOCK_INTS.dirt,
    },
    {
        name: 'Build Leaf',
        build: true,
        reload: 10,
        requiredKills: 50,
        type: BLOCK_INTS.leaves,
    },
    {
        name: 'Build Stone',
        build: true,
        reload: 10,
        requiredKills: 200,
        type: BLOCK_INTS.stone,
    },
    {
        name: 'Build Wood',
        build: true,
        reload: 6,
        requiredKills: 100,
        type: BLOCK_INTS.wood,
    },
    {
        name: 'Build Iron',
        build: true,
        reload: 30,
        requiredKills: 500,
        type: BLOCK_INTS.iron,
    },
];
