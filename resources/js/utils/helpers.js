const generateYoutubePreview = (url) => {
    const queryString = url.split("?")[1];
    const urlSearchParams = new URLSearchParams(queryString);
    const params = Object.fromEntries(urlSearchParams.entries());
    const { v: youtubeId } = params;
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
};

module.exports = {
    generateYoutubePreview,
};
