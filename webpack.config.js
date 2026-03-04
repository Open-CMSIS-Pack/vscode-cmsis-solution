//@ts-check
'use strict';

const path = require('path');
const webpack = require('webpack');
const copy = require('copy-webpack-plugin');

/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @type WebpackConfig */
const common = {
    mode: 'development',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.webpack.json',
                        onlyCompileBundledFiles: process.env.CI === 'true',
                        transpileOnly: process.env.CI === 'true' // full type-check locally; lighter in CI
                    }
                },
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    externals: {
        vscode: 'commonjs vscode',
        'applicationinsights-native-metrics': 'commonjs applicationinsights-native-metrics',
        "@lydell/node-pty": "commonjs @lydell/node-pty",
    }
};

/**
 * @param {*} _env
 * @param {*} argv
 * @returns WebpackConfig[]
 */
module.exports = (_env, argv) => [
    {
        ...common,
        target: 'node',
        entry: {
            extension: './src/desktop/extension.ts'
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: 'commonjs'
        },
        plugins: [
            new webpack.ProvidePlugin({
                crypto: ['crypto', 'webcrypto'],
                fetch: ['node-fetch', 'default'],
                Blob: ['fetch-blob', 'default'],
                FormData: ['formdata-polyfill/esm.min.js', 'FormData']
            }),
        ]
    },
    {
        ...common,
        target: 'web',
        // The VS Code devtools can't load up source maps for webview code, so we must include them inline.
        // This increases the bundle size a lot, so only do this in development mode.
        devtool: argv.mode === 'production' ? false : 'inline-source-map',
        entry: {
            manageComponentsPacks: './src/views/manage-components-packs/components-packs-webview-view.ts',
            createSolution: './src/views/create-solutions/create-solution-webview-view.ts',
            manageSolution: './src/views/manage-solution/manage-solution-webview-view.ts',
            configWizard: './src/views/config-wizard/confwiz-webview-view.ts',
            configureSolution: './src/views/manage-layers/manage-layers-webview-view.ts'
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist', 'views')
        },
        plugins: [
            new copy({
                patterns: [
                    {
                        from: 'node_modules/@vscode/webview-ui-toolkit/dist/toolkit.min.js'
                    },
                    {
                        from: 'node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css',
                        to: 'css'
                    },
                    {
                        from: 'node_modules/@fortawesome/fontawesome-free/css/solid.min.css',
                        to: 'css'
                    },
                    {
                        from: 'node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2',
                        to: 'webfonts'
                    }
                ]
            })
        ]
    },
];
