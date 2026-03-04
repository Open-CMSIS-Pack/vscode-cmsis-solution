const semver = require('semver');
const package = require('./package.json');
const codepoints = require('./src/icons/mapping.json');
const versionWithoutPatch = `${semver.major(package.version)}.${semver.minor(package.version)}`

const nodefs = require('node:fs');

nodefs.mkdirSync(`${__dirname}/dist`, { recursive: true });

module.exports = {
    name: 'codicon',
    prefix: 'codicon',
    codepoints: codepoints,
    inputDir: './src/icons',
    outputDir: './dist',
    fontTypes: ['ttf'],
    normalize: true,
    assetTypes: [],
    formatOptions: {
        ttf: {
            url: package.url,
            description: package.description,
            version: versionWithoutPatch
        }
    }
};