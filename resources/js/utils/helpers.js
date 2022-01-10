const { getImageURL } = require("./cloudinary");

const handleURL = (url) => {
    return {
        query: (name) => {
            const queryString = url.split("?")[1];
            const urlSearchParams = new URLSearchParams(queryString);
            const params = Object.fromEntries(urlSearchParams.entries());
            if (name) {
                return params[name];
            }
            return params;
        },
    };
};

const generateYoutubePreview = (url) => {
    const youtubeId = handleURL(url).query("v");
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
};

const createPreviewImage = (file) => {
    if (!file) return;
    if (typeof file === "object") {
        if (file.lastModified) {
            return URL.createObjectURL(file, { eager: "c_thumb,g_center,w_300" });
        }
        if (file.origin) {
            return getImageURL(file);
        }
    } else if (typeof file === "string") {
        if (file.includes("youtube")) {
            return generateYoutubePreview(file);
        }
    }
};

const pick = (object, keys) => {
    return keys.reduce((acc, key) => {
        const value = object[key];
        if (value.value !== undefined) {
            acc[key] = value.value;
        } else {
            acc[key] = value;
        }
        return acc;
    }, {});
};

module.exports = {
    handleURL,
    generateYoutubePreview,
    createPreviewImage,
    pick,
};
