const getAPIGateway = () => {
    const domain = window.location.hostname;
    if (domain === "localhost" || domain === "127.0.0.1") {
        return "http://localhost:3000/api/v1";
    }
    return "baolocre.encacap.com/api/v1";
};

module.exports = {
    API_GATEWAY: getAPIGateway(),
};
