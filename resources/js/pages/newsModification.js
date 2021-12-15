const FroalaEditor = require("froala-editor");
// Load Froala plugins.
require("froala-editor/js/plugins/align.min");
require("froala-editor/js/plugins/image.min");

const { nanoid } = require("nanoid");
const axios = require("axios");

const prepare = require("../utils/prepare");
const EncacapForm = require("../utils/form");
const EncacapFiles = require("../utils/files");

const { createPreviewImage } = require("../utils/helpers");
const { normalizeImageData, getImageURL } = require("../utils/cloudinary");

const convertStringToHTML = (string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(string, "text/html");
    return doc;
};

prepare(async (request) => {
    const newsForm = new EncacapForm("#news_form");

    newsForm.validate({
        title: [
            {
                role: "required",
                message: "Tiêu đề không được phép để trống",
            },
        ],
        category: [
            {
                role: "required",
                message: "Danh mục không được phép để trống",
            },
        ],
    });

    const submitButton = newsForm.querySelector("button[type=submit]");

    const froala = new FroalaEditor("#content", {
        placeholderText: "Nhập nội dung tin tức",
    });

    const formActions = newsForm.querySelector(".footer");

    formActions.classList.add("flex");
    formActions.classList.remove("footer--hide");
    formActions.style.width = `${newsForm.getForm().clientWidth - 11}px`;

    const newsImageFiles = new EncacapFiles();
    let newsImageElements = [];

    let newsData = {
        avatar: {},
        pictures: [],
    };

    const avatarContainer = newsForm.querySelector("#avatar_container");
    const avatarImagesGroup = avatarContainer.querySelector(".form-images-group");
    const avatarImage = avatarContainer.querySelector(".form-images-preview img");
    const avatarInput = avatarContainer.querySelector("input");

    const renderAvatarPreview = (file = null) => {
        avatarInput.error.hide();
        if (!file) {
            avatarImagesGroup.classList.remove("has-items");
            return;
        }
        avatarImage.src = createPreviewImage(file);
        avatarImagesGroup.classList.add("has-items");
    };

    avatarInput.onchange = () => {
        const avatarFile = avatarInput.files[0];
        if (!avatarFile) return;
        renderAvatarPreview(avatarFile);
    };

    const cloudinaryInstance = axios.create({
        baseURL: "https://api.cloudinary.com/v1_1",
    });

    const uploadImage = (file, options) => {
        const { key: apiKey, eager, folder, timestamp, signature, name } = options;
        const formData = new FormData();

        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("eager", eager);
        formData.append("folder", folder);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
        return cloudinaryInstance.post(`${name}/image/upload`, formData);
    };

    newsForm.onsubmit = async (event, data) => {
        const unexpectedKeys = ["avatar"];
        newsData = Object.assign(
            newsData,
            Object.keys(data).reduce((acc, key) => {
                if (unexpectedKeys.includes(key)) {
                    return acc;
                }
                return {
                    ...acc,
                    [key]: data[key].value,
                };
            }, {})
        );

        const newsContentString = froala.html.get();
        const newsContentHTML = convertStringToHTML(newsContentString);

        submitButton.loading.show();

        const avatarFile = avatarInput.files[0];

        if (!avatarFile) {
            avatarInput.error.show("Ảnh đại diện không được phép để trống");
            submitButton.loading.hide();
            newsForm.enable();
            return;
        }

        newsImageElements = newsContentHTML.images;

        const promises = [];

        if (newsImageElements.length > 0) {
            Array.from(newsImageElements).forEach((image) => {
                const imageSrc = image.src;
                if (!imageSrc.includes("cloudinary")) {
                    promises.push(
                        axios.get(imageSrc, {
                            responseType: "arraybuffer",
                        })
                    );
                }
            });
        }

        const newsImagesResponses = await Promise.all(promises);

        newsImagesResponses.forEach((response) => {
            const { data: imageArraybuffer } = response;
            const imageFile = new File([imageArraybuffer], `${nanoid()}.jpeg`, {
                type: "image/jpeg",
            });
            newsImageFiles.push(imageFile);
        });

        let signature;

        try {
            const { data: response } = await request.get("images/signature", {
                params: {
                    type: "news",
                },
            });
            signature = response;
        } catch (error) {
            newsForm.showError("Đã xảy ra lỗi khi kết nối với máy chủ.", error?.response.data || error);
            newsForm.enable();
            submitButton.loading.hide();
            return;
        }

        try {
            const { data: avatarResponse } = await uploadImage(avatarInput.files[0], signature);
            newsData.avatar = normalizeImageData({ ...avatarResponse, ...signature });
        } catch (error) {
            newsForm.showError("Đã xảy ra lỗi khi tải lên ảnh đại diện.", error?.response.data || error);
            newsForm.enable();
            submitButton.loading.hide();
            return;
        }

        if (newsImageFiles.length > 0) {
            try {
                const imageResponses = await Promise.all(
                    newsImageFiles.files.map((file) => uploadImage(file, signature))
                );
                newsData.pictures = imageResponses.map((imageResponse) =>
                    normalizeImageData({ ...imageResponse.data, ...signature })
                );
            } catch (error) {
                newsForm.showError("Đã xảy ra lỗi khi xử lý nội dung tin tức.", error?.response.data || error);
                newsForm.enable();
                submitButton.loading.hide();
                return;
            }
        }

        Array.from(newsImageElements).forEach((image, index) => {
            // eslint-disable-next-line no-param-reassign
            image.src = getImageURL(newsData.pictures[index]);
        });

        newsData.content = newsContentHTML.body.innerHTML;

        try {
            const {
                data: { id },
            } = await request.post("news", newsData);
            window.location.href = `?id=${id}&notification=published`;
        } catch (error) {
            newsForm.showError("Đã xảy ra lỗi khi lưu tin tức.", error?.response.data || error);
            newsForm.enable();
            submitButton.loading.hide();
        }
    };
});
