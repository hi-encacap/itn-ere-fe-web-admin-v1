const path = require("path");

module.exports = {
    mode: process.env.NODE_ENV || "development",
    entry: {
        home: ["./resources/js/pages/home.js"],
        location_management: ["./resources/js/pages/locationManagement.js"],
        login: ["./resources/js/pages/login.js"],
        modify_estate: ["./resources/js/pages/modifyEstate.js"],
    },
    output: {
        filename: "[name].min.js",
        path: path.resolve(__dirname, "assets/js"),
    },
    devtool: "source-map",
};
