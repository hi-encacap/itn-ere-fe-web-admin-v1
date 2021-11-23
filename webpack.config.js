const path = require("path");

module.exports = {
    mode: process.env.NODE_ENV || "development",
    entry: {
        location_management: ["./resources/js/locationManagement.js"],
    },
    output: {
        filename: "[name].min.js",
        path: path.resolve(__dirname, "assets/js"),
    },
    devtool: "source-map",
};
