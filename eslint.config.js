/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const {
    fixupConfigRules,
    fixupPluginRules,
} = require("@eslint/compat");

const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");
const unusedImports = require("eslint-plugin-unused-imports");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = [{
    ignores: [
        "**/out",
        "**/dist",
        "**/node_modules",
        "src/solar-search/graphql/client",
        "**/*.vsix"
    ],
}, ...fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
)), {
    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        "unused-imports": unusedImports,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 6,
        sourceType: "module",

        parserOptions: {
            project: ["./tsconfig.json", "./scripts/tsconfig.json", "./api/tsconfig.json"],
        },

        globals: {
            process: "readonly",
        },
    },

    files: ["**/*.ts", "**/*.tsx"],

    settings: {
        react: {
            version: "detect",
        },
    },

    rules: {
        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
        }],

        "@typescript-eslint/no-this-alias": ["off"],
        "@typescript-eslint/prefer-readonly": ["error"],
        "block-spacing": ["error", "always"],

        "brace-style": ["error", "1tbs", {
            allowSingleLine: true,
        }],

        "eol-last": ["error"],

        indent: ["error", 4, {
            SwitchCase: 1,
        }],

        "linebreak-style": ["error", "unix"],

        "no-constant-condition": ["error", {
            checkLoops: false,
        }],

        "no-redeclare": "off",
        "no-trailing-spaces": ["error"],
        "object-curly-spacing": ["error", "always"],

        quotes: ["error", "single", {
            avoidEscape: true,
        }],

        semi: ["error", "always"],
        "space-in-parens": "error",
        "space-before-blocks": "error",
        "keyword-spacing": "error",
        "space-infix-ops": "error",
        "react/prop-types": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
            "warn",
            { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
        ],
    },
}];
