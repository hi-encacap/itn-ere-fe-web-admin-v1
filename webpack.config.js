const path = require("path");

module.exports = {
    mode: process.env.NODE_ENV || "development",
    entry: {
        home: ["./resources/js/pages/home.js"],
        login: ["./resources/js/pages/login.js"],
        location_management: ["./resources/js/pages/locationManagement.js"],
        estate_modification: ["./resources/js/pages/estateModification.js"],
        estate_management: ["./resources/js/pages/estateManagement.js"],
        news_management: ["./resources/js/pages/newsManagement.js"],
        news_modification: ["./resources/js/pages/newsModification.js"],
    },
    output: {
        filename: "[name].min.js",
        path: path.resolve(__dirname, "assets/js"),
    },
    devtool: "source-map",
};
