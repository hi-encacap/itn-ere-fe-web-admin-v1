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

const normalizeImageData = (data) => {
    if (typeof data === "string") {
        let youtubeId = null;

        if (data.includes("v")) {
            youtubeId = handleURL(data).query("v");
        } else if (data.includes("youtu.be")) {
            const urlParts = data.split("/");
            youtubeId = urlParts[urlParts.length - 1];
        }

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
        origin: "https://res.cloudinary.com",
        resourceType,
        name,
        action,
        version,
        publicId,
        format,
    };
};

const getImageURL = (data, options) => {
    if (data.resourceType === "image") {
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
    }
    const { publicId: youtubeId } = data;

    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
};

const getPublicIdFromURL = (url) => {
    const filename = url.split("/").pop();
    const [publicId] = filename.split(".");
    return publicId;
};

module.exports = {
    normalizeImageData,
    getImageURL,
    getPublicIdFromURL,
};
