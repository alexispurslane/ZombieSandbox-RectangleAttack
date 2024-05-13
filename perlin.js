let M = 4294967296,
    // a - 1 should be divisible by m's prime factors
    A = 1664525,
    // c and m should be co-prime
    C = 1;

/**
 *
 * The PRNG's seed
 *
 * */
let Z = Math.floor(Math.random() * M);

/**
 *
 * Linear congruential pseudorandom number generator (so we can repeat worlds via seeds)
 */
function rand() {
    Z = (A * Z + C) % M;
    return Z / M;
}

/**
 *
 *  Interpolates smoothly between two values (pa and pb) based on how far you
 *  are between them (represented by px)
 *
 */
function interpolate(pa, pb, px) {
    let ft = px * Math.PI,
        f = (1 - Math.cos(ft)) * 0.5;
    return pa * (1 - f) + pb * f;
}

/**
 *
 * Generate n samplings of 1-dimensional perlin noise with the given amplitude
 * and wavelength for use with terrain generation
 *
 * */
export function perlin1d(n, amp, wl) {
    let fq = 1 / wl,
        a = rand(),
        b = rand();

    let output = Array(n);
    for (let x = 0; x < n; x++) {
        if (x % wl === 0) {
            a = b;
            b = rand();
            output[x] = a * amp;
        } else {
            output[x] = interpolate(a, b, (x % wl) / wl) * amp;
        }
    }

    return output;
}
