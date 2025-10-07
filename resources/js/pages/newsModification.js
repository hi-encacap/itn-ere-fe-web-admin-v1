const FroalaEditor = require("froala-editor");
// Load Froala plugins.
// require("froala-editor/js/plugins/align.min");
// require("froala-editor/js/plugins/image.min");
// require("froala-editor/js/plugins/font_family.min");
// require("froala-editor/js/plugins/font_size.min");
// require("froala-editor/js/plugins/link.min");
// require("froala-editor/js/plugins/lists.min");
// require("froala-editor/js/plugins/url.min");
// require("froala-editor/js/plugins/word_paste.min");

const { nanoid } = require("nanoid");
const axios = require("axios");

const prepare = require("../utils/prepare");
const EncacapForm = require("../utils/form");
const EncacapFiles = require("../utils/files");
const EncacapUpload = require("../utils/upload");

const { createPreviewImage, handleURL, pick } = require("../utils/helpers");
const { normalizeImageData, getImageURL } = require("../utils/cloudinary");

const convertStringToHTML = (string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(string, "text/html");
    return doc;
};

prepare(async (request) => {
    const newsForm = new EncacapForm("#news_form");
    const encacapUpload = new EncacapUpload();

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

    // Hiển thị thông báo (nếu có)
    const notificationQuery = handleURL(window.location.href).query("notification");

    if (notificationQuery) {
        const notifications = {
            published: "Đã xuất bản bài viết thành công.",
            saved: "Đã lưu bài viết thành công.",
        };
        newsForm.showSuccess(notifications[notificationQuery]);
    }

    const submitButton = newsForm.querySelector("button[type=submit]");
    const secondaryButton = newsForm.querySelector("button[type=button]");
    const titleInput = newsForm.querySelector("input[name=title]");
    const categorySelect = newsForm.querySelector("select[name=category]");

    const froala = new FroalaEditor("#content", {
        placeholderText: "Nhập nội dung tin tức",
    });

    const froalaCopyright = document.querySelector(".fr-wrapper.show-placeholder > div:nth-child(1)");
    if (froalaCopyright) {
        froalaCopyright.style.display = "none";
    }

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

    const newsId = handleURL(window.location.href).query("id");

    if (newsId) {
        try {
            const { data } = await request.get(`news/${newsId}`);

            newsData = data;

            froala.html.set(data.decodedContent);

            titleInput.value = data?.title;
            categorySelect.value = data.category?.slug || "";

            submitButton.querySelector("span").innerText = "Cập nhật";

            if (data.isPublished) {
                submitButton.dataset.action = "publish";
                secondaryButton.style.display = "none";
            } else {
                submitButton.dataset.action = "save";
                secondaryButton.dataset.action = "publish";
                secondaryButton.querySelector("span").innerText = "Xuất bản";
            }
        } catch (error) {
            newsForm.showError("Đã xảy ra lỗi khi lấy thông tin tin tức.", error.response?.data || error);
        }
    }

    const avatarContainer = newsForm.querySelector("#avatar_container");
    const avatarImagesGroup = avatarContainer.querySelector(".form-images-group");
    const avatarImage = avatarContainer.querySelector(".form-images-preview img");
    const avatarInput = avatarContainer.querySelector("input");

    let avatarFile = null;

    const renderAvatarPreview = (file = null) => {
        avatarInput.error.hide();
        if (!file) {
            avatarImagesGroup.classList.remove("has-items");
            return;
        }
        avatarImage.src = createPreviewImage(file);
        avatarImagesGroup.classList.add("has-items");
    };

    if (newsData?.avatar?.origin) {
        renderAvatarPreview(newsData.avatar);
    }

    avatarInput.onclick = (event) => {
        event.preventDefault();
        encacapUpload.upload((file) => {
            avatarFile = file;
            renderAvatarPreview(file);
        });
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

    const handleSubmit = async (validation = true) => {
        if (validation) {
            if (!newsForm.executeValidation()) {
                submitButton.loading.hide();
                secondaryButton.loading.hide();
                return;
            }
        }

        newsForm.disable();

        const inputData = newsForm.getData();
        newsData = Object.assign(newsData, pick(inputData, ["title", "category", "content"]));

        newsData.isPublished = validation;

        const newsContentString = froala.html.get();
        const newsContentHTML = convertStringToHTML(newsContentString);

        let totalNewImages = 0;

        if (validation) {
            if (!avatarFile && !newsData.avatar?.origin) {
                avatarInput.error.show("Ảnh đại diện không được phép để trống");
                submitButton.loading.hide();
                secondaryButton.loading.hide();
                newsForm.enable();
                return;
            }
        }

        newsImageElements = newsContentHTML.images;

        const promises = [];

        if (newsImageElements.length > 0) {
            Array.from(newsImageElements).forEach((image) => {
                const imageSrc = image.src;
                if (!imageSrc.includes("cloudinary")) {
                    totalNewImages += 1;
                }
                // if (!imageSrc.includes("cloudinary")) {
                //     promises.push(
                //         axios.get(imageSrc, {
                //             responseType: "arraybuffer",
                //         })
                //     );
                // }
                promises.push(
                    axios.get(imageSrc, {
                        responseType: "arraybuffer",
                    })
                );
            });
        }

        const newsImagesResponses = await Promise.all(promises);

        if (totalNewImages > 0) {
            newsImagesResponses.forEach((response) => {
                const { data: imageArraybuffer } = response;
                const imageFile = new File([imageArraybuffer], `${nanoid()}.jpeg`, {
                    type: "image/jpeg",
                });
                newsImageFiles.push(imageFile);
            });
        }

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
            secondaryButton.loading.hide();
            return;
        }

        if (avatarFile) {
            try {
                const { data: avatarResponse } = await uploadImage(avatarFile, signature);
                newsData.avatar = normalizeImageData({ ...avatarResponse, ...signature });
            } catch (error) {
                newsForm.showError("Đã xảy ra lỗi khi tải lên ảnh đại diện.", error?.response.data || error);
                newsForm.enable();
                submitButton.loading.hide();
                secondaryButton.loading.hide();
                return;
            }
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
                secondaryButton.loading.hide();
                return;
            }
        }

        if (totalNewImages > 0) {
            Array.from(newsImageElements).forEach((image, index) => {
                // eslint-disable-next-line no-param-reassign
                image.src = getImageURL(newsData.pictures[index]);
            });
        }

        newsData.content = newsContentHTML.body.innerHTML;

        if (totalNewImages === 0) {
            newsData.pictures = [];
        }

        try {
            if (!newsId) {
                const {
                    data: { id },
                } = await request.post("news", newsData);
                window.location.href = `?id=${id}&notification=${validation ? "published" : "saved"}`;
            } else {
                await request.patch(`news/${newsId}`, {
                    title: newsData.title,
                    avatar: newsData.avatar,
                    category: newsData.category,
                    content: newsData.content,
                    isPublished: validation,
                    pictures: newsData.pictures,
                    priority: newsData.priority,
                });
                window.location.href = `?id=${newsId}&notification=${validation ? "published" : "saved"}`;
                submitButton.loading.hide();
                secondaryButton.loading.hide();
            }
        } catch (error) {
            newsForm.showError("Đã xảy ra lỗi khi lưu tin tức.", error?.response.data || error);
            newsForm.enable();
            submitButton.loading.hide();
            secondaryButton.loading.hide();
        }
    };

    // newsForm.onsubmit = async () => handleSubmit(true);
    submitButton.onclick = (event) => {
        event.preventDefault();
        submitButton.loading.show();
        const buttonElement = event.target.closest("button");
        const { action } = buttonElement.dataset;
        if (action === "publish") {
            handleSubmit(true);
        } else if (action === "save") {
            handleSubmit(false);
        }
    };

    secondaryButton.onclick = (event) => {
        event.preventDefault();
        secondaryButton.loading.show();
        const buttonElement = event.target.closest("button");
        const { action } = buttonElement.dataset;
        if (action === "publish") {
            handleSubmit(true);
        } else if (action === "save") {
            handleSubmit(false);
        }
    };
});
