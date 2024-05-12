const blocks = {
    bedrock: '#363532',
    fire: 'rgba(255, 0, 0, 0.7)',
    stone: '#807E79',
    iron: '#61666A',
    power_iron: 'rgba(255, 0, 0, 0.7)',
    wood: '#9F763B',
    platform: '#9F763B',
    dirt: '#AE9A73',
    water: 'rgba(0,72,151,0.5)',
    cloud: 'rgba(255,255,255,0.7)',
    leaves: 'rgba(100, 200, 50, 0.8)',
    dark_leaves: 'rgba(0, 51, 0, 0.9)',
};

let BLOCK_INTS = {};
let BLOCK_COLORS = [];
Object.keys(blocks).forEach((block, i) => {
    BLOCK_INTS[block] = i;
    BLOCK_COLORS[i] = blocks[block];
});

export { BLOCK_INTS, BLOCK_COLORS };
