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

module.exports = {
    generateYoutubePreview,
    handleURL,
};
