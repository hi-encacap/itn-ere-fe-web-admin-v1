// eslint-disable-next-line import/no-extraneous-dependencies
const postCSSImport = require("postcss-import");
// eslint-disable-next-line import/no-extraneous-dependencies
const tailwindCSS = require("tailwindcss");
// eslint-disable-next-line import/no-extraneous-dependencies
const postCSSNested = require("tailwindcss/nesting");
// eslint-disable-next-line import/no-extraneous-dependencies
const autoPrefixer = require("autoprefixer");
// eslint-disable-next-line import/no-extraneous-dependencies
const cssNano = require("cssnano");

module.exports = {
    plugins: [postCSSImport, postCSSNested, tailwindCSS, autoPrefixer, cssNano],
};
