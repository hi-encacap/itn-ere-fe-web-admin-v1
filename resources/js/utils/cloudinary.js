const { handleURL } = require("./helpers");

const normalizeImageData = (data) => {
    if (typeof data === "string") {
        const youtubeId = handleURL(data).query("v");
        return {
            origin: "https://img.youtube.com",
            name: "vi",
            resourceType: "video",
            publicId: youtubeId,
            format: "sddefault.jpg",
        };
    }
    const { name, resource_type: resourceType, type: action, version, public_id: publicId, format } = data;
    return {
        origin: "http://res.cloudinary.com",
        resourceType,
        name,
        action,
        version,
        publicId,
        format,
    };
};

const getImageURL = (data, options) => {
    const { origin, name, resourceType, action, version, publicId, format } = data;
    let url = `${origin}/${name}/${resourceType}/${action}/`;
    if (options?.eager) {
        url += `${options?.eager}/`;
    } else {
        url += `q_auto,f_auto/`;
    }
    url += `v${version}/`;
    url += `${publicId}.${format}`;
    return url;
};

module.exports = {
    normalizeImageData,
    getImageURL,
};
