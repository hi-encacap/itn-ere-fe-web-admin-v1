const axios = require("axios");
const { API_GATEWAY } = require("../configs/configs");
const storage = require("./storage");
const redirect = require("./redirect");

const createAxiosInstance = () => {
    const tokens = storage("tokens").get();
    if (!tokens) redirect.login();
    const instance = axios.create({
        baseURL: API_GATEWAY,
        timeout: 5000,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${tokens.access.token}`,
        },
    });
    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const { response, config } = error;
            if (response) {
                const { status } = response;
                if (status === 401) {
                    const { refresh: refreshToken } = tokens;
                    if (!refreshToken) {
                        redirect.login();
                        return Promise.reject(error);
                    }
                    try {
                        const { data } = await axios.post(
                            "auth/refresh-tokens",
                            {
                                refreshToken: refreshToken.token,
                            },
                            config
                        );
                        storage("tokens").set(data);
                        instance.defaults.headers.common.Authorization = `Bearer ${data.access.token}`;
                        config.headers.Authorization = `Bearer ${data.access.token}`;
                        return instance(config);
                    } catch (refreshError) {
                        redirect.login();
                        return Promise.reject(refreshError);
                    }
                }
            }
            return Promise.reject(error);
        }
    );
    return instance;
};

module.exports = createAxiosInstance;
