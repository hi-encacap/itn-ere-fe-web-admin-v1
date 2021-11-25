const storage = require("./storage");
const redirect = require("./redirect");
const createAxiosInstance = require("./createAxiosInstance");

const loading = (() => {
    const loadingNode = document.querySelector(".page-loading");
    if (!loadingNode) {
        return {
            show: () => {},
            hide: () => {},
        };
    }
    return {
        show: () => {
            loadingNode.classList.remove("hidden-loading");
        },
        hide: () => {
            loadingNode.classList.add("hidden-loading");
        },
    };
})();

module.exports = (callback, options) => {
    window.onload = async () => {
        if (options?.isVerify === false) {
            loading.hide();
            callback(loading);
            return;
        }
        const user = storage("user").get();
        const axios = createAxiosInstance(options);
        try {
            const { data } = await axios.get(`/users/${user.id}`);
            if (data.id !== user.id) {
                storage("user").remove();
                storage("tokens").remove();
                redirect.login();
                return;
            }
            loading.hide();
            callback(axios, loading);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
        }
    };
};
