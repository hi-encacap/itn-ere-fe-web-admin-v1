// eslint-disable-next-line import/no-extraneous-dependencies
const lineClampPlugin = require("@tailwindcss/line-clamp");

module.exports = {
    purge: ["./**/*.html", "./resources/**/*.js"],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                encacap: {
                    main: "#FB8500",
                    yellow: "#FFB703",
                    facebook: "#1877f2",
                    zalo: "#03a5fa",
                },
            },
        },
    },
    variants: {
        extend: {
            ring: ["responsive", "hover", "focus", "active"],
        },
    },
    plugins: [lineClampPlugin],
};
