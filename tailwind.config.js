// eslint-disable-next-line import/no-extraneous-dependencies
const lineClampPlugin = require("@tailwindcss/line-clamp");

module.exports = {
    mode: process.env.NODE_ENV === "production" ? "jit" : "",
    purge: ["./**/*.html", "./resources/**/*.js"],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                encacap: {
                    main: { DEFAULT: "#00B8A9", dark: "#008076", light: "#00d8c6" },
                    second: "#F8F3D4",
                    third: "#F6416C",
                    fourth: "#FFDE7D",
                    yellow: "#FFB703",
                    facebook: "#1877f2",
                    zalo: "#03a5fa",
                },
            },
            maxWidth: {
                mobile: "480px",
            },
            zIndex: {
                60: 60,
                70: 70,
                80: 80,
                90: 90,
                100: 100,
            },
            transitionProperty: {
                bg: "background-color",
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
