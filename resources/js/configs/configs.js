const getAPIGateway = () => {
    const domain = window.location.hostname;
    if (domain === "localhost" || domain === "127.0.0.1") {
        return "http://localhost:3000/api/v1";
    }
    return "https://www.nhabansaigon.app.ere.encacap.dev/api/v1";
};

module.exports = {
    API_GATEWAY: getAPIGateway(),
    GHN_TOKEN: "ce267a29-7885-11ed-be76-3233f989b8f3",
};
