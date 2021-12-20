const axios = require("axios");
const prepare = require("../utils/prepare");
const EncacapModal = require("../utils/modal");
const EncacapForm = require("../utils/form");

const SliderItem = require("../components/SliderItem");

const { createPreviewImage } = require("../utils/helpers");
const { normalizeImageData, getImageURL } = require("../utils/cloudinary");

const getConfig = (configs, name) => {
    const config = configs.find((c) => c.name === name);
    return config ? config.value : null;
};

const updateConfig = async (request, name, value) => {
    try {
        await request.post("/configs", { configs: [{ name, value }] });
    } catch (error) {
        throw new Error(error.response?.data || error);
    }
};

const handleContactInformation = async (request) => {
    const contactInformationForm = new EncacapForm("#contact_information_form");

    const submitButton = contactInformationForm.querySelector("button[type=submit]");
    const addressInput = contactInformationForm.querySelector("#address");
    const phoneInput = contactInformationForm.querySelector("#phone");
    const zaloInput = contactInformationForm.querySelector("#zalo");
    const facebookInput = contactInformationForm.querySelector("#facebook");
    const youtubeInput = contactInformationForm.querySelector("#youtube");

    let contactInformation = [];

    contactInformationForm.validate({
        address: [
            {
                role: "required",
                message: "Địa chỉ không được phép để trống",
            },
        ],
        phone: [
            {
                role: "required",
                message: "Số điện thoại không được phép để trống",
            },
        ],
        zalo: [
            {
                role: "required",
                message: "Zalo không được phép để trống",
            },
        ],
    });

    contactInformationForm.disable();

    try {
        const { data } = await request.get("/configs", {
            params: {
                names: "address,phone,zalo,facebook,youtube",
            },
        });
        contactInformation = data;
        contactInformationForm.enable();
    } catch (error) {
        contactInformationForm.showError(error.response?.data || error);
    }

    //  Đổ dữ liệu vào các trường của Thông tin liên hệ
    addressInput.value = getConfig(contactInformation, "address");
    phoneInput.value = getConfig(contactInformation, "phone");
    zaloInput.value = getConfig(contactInformation, "zalo");
    facebookInput.value = getConfig(contactInformation, "facebook");
    youtubeInput.value = getConfig(contactInformation, "youtube");

    // Cập nhật thông tin liên hệ
    contactInformationForm.onsubmit = async (event, data) => {
        contactInformation = Object.keys(data).reduce((information, key) => {
            information.push({
                name: key,
                value: data[key].value,
            });
            return information;
        }, []);

        submitButton.loading.show();

        try {
            await request.post("/configs", {
                configs: contactInformation,
            });
            contactInformationForm.showSuccess("Cập nhật thông tin liên hệ thành công.");
            submitButton.loading.hide();
            contactInformationForm.enable();
            return;
        } catch (error) {
            contactInformationForm.showError(
                "Đã xảy ra lỗi khi cập nhật thông tin liên hệ.",
                error.response?.data || error
            );
            submitButton.loading.hide();
            contactInformationForm.enable();
        }
    };
};

const handleSlider = async (request) => {
    let sliderData = [];

    const addImageButton = document.querySelector("#upload_image");

    const uploadImageForm = new EncacapForm("#add_slider_form");
    const uploadImageModal = new EncacapModal("#add_slider_modal");

    const imageContainer = uploadImageForm.querySelector("#avatar_container");
    const imagesGroup = imageContainer.querySelector(".form-images-group");
    const imageElement = imageContainer.querySelector(".form-images-preview img");
    const imageInput = imageContainer.querySelector("input");

    const sliderContainer = document.querySelector("#slider_container");

    const uploadImageSubmitButton = uploadImageForm.querySelector("button[type=submit]");

    const renderSlider = (data) => {
        sliderContainer.innerHTML = "";
        if (data.length === 0) {
            sliderContainer.innerHTML = `
                <div
                    class="
                        border-2
                        border-gray-200
                        bg-gray-100
                        rounded-md
                        p-2
                        text-center
                    "
                >
                    Không có hình ảnh nào
                </div>
            `;
            return;
        }
        data.forEach((slider) => {
            const sliderItem = SliderItem({ ...slider, url: getImageURL(slider) });
            sliderContainer.appendChild(sliderItem);
        });
    };

    const cloudinaryInstance = axios.create({
        baseURL: "https://api.cloudinary.com/v1_1",
    });

    const renderAvatarPreview = (file = null) => {
        imageInput.error.hide();
        if (!file) {
            imagesGroup.classList.remove("has-items");
            return;
        }
        imageElement.src = createPreviewImage(file);
        imagesGroup.classList.add("has-items");
    };

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

    const deleteImage = async (image) => {
        if (!image) return;
        try {
            await request.post(`/images/delete`, {
                images: [image],
            });
        } catch (error) {
            throw new Error(error);
        }
    };

    const updateSliderConfig = async () => {
        await updateConfig(request, "slider", JSON.stringify(sliderData));
    };

    try {
        const { data } = await request.get("/configs", {
            params: {
                names: "slider",
            },
        });
        if (data.length > 0) {
            sliderData = JSON.parse(data[0].value);
        }
        renderSlider(sliderData);
    } catch (error) {
        console.log(error);
    }

    addImageButton.onclick = () => {
        uploadImageForm.hideNotify();
        uploadImageForm.enable();
        imageInput.value = null;
        uploadImageSubmitButton.loading.hide();
        renderAvatarPreview();
        uploadImageModal.show();
    };

    imageInput.onchange = () => {
        const avatarFile = imageInput.files[0];
        if (!avatarFile) return;
        renderAvatarPreview(avatarFile);
    };

    uploadImageForm.onsubmit = async () => {
        const imageFile = imageInput.files[0];

        uploadImageSubmitButton.loading.show();

        if (!imageFile) {
            imageInput.error.show("Vui lòng chọn hình ảnh.");
            uploadImageForm.enable();
            uploadImageSubmitButton.loading.hide();
            return;
        }

        let signature = null;

        try {
            const { data } = await request.get("images/signature", {
                params: {
                    type: "news",
                },
            });
            signature = data;
        } catch (error) {
            uploadImageForm.enable();
            uploadImageForm.showError("Đã xảy ra lỗi khi kết nối với máy chủ.", error.response?.data || error);
            uploadImageSubmitButton.loading.hide();
            return;
        }

        try {
            const { data: imageResponse } = await uploadImage(imageFile, signature);
            sliderData.unshift(normalizeImageData({ ...imageResponse, ...signature }));
            await updateSliderConfig();
            renderSlider(sliderData);
            uploadImageModal.hide();
        } catch (error) {
            uploadImageForm.enable();
            uploadImageForm.showError("Đã xảy ra lỗi khi thêm hình ảnh mới.", error);
            uploadImageSubmitButton.loading.hide();
        }
    };

    const confirmDeleteModal = new EncacapModal("#confirm_delete_modal");
    const confirmDeleteForm = new EncacapForm("#confirm_delete_form");
    const confirmDeleteButton = confirmDeleteForm.querySelector("button[type=submit]");
    const deletedImageElement = confirmDeleteForm.querySelector("#deleted_image");

    confirmDeleteForm.onsubmit = async () => {
        confirmDeleteButton.loading.show();
        try {
            const deletedImageId = confirmDeleteButton.dataset.id;
            const deletedImage = sliderData.find((image) => image.publicId === deletedImageId);
            if (!deletedImage) {
                confirmDeleteModal.hide();
                return;
            }
            await deleteImage(deletedImage);
            sliderData = sliderData.filter((image) => image.publicId !== deletedImageId);
            await updateSliderConfig();
            confirmDeleteModal.hide();
            renderSlider(sliderData);
        } catch (error) {
            confirmDeleteForm.showError("Đã xảy ra lỗi khi xóa hình ảnh.", error);
            confirmDeleteButton.loading.hide();
        }
    };

    sliderContainer.onclick = (event) => {
        const clickedButton = event.target.closest(".button");
        if (!clickedButton) return;
        const { id: imageId, action } = clickedButton.dataset;
        try {
            if (action === "delete") {
                const deletedImage = sliderData.find((img) => img.publicId === imageId);
                confirmDeleteButton.dataset.id = imageId;
                deletedImageElement.src = getImageURL(deletedImage);
                confirmDeleteForm.enable();
                confirmDeleteModal.show();
                confirmDeleteButton.loading.hide();
            } else if (action === "up") {
                const imageIndex = sliderData.findIndex((img) => img.publicId === imageId);
                if (imageIndex === 0) return;
                const image = sliderData.splice(imageIndex, 1)[0];
                sliderData.splice(imageIndex - 1, 0, image);
                renderSlider(sliderData);
                updateSliderConfig();
            } else if (action === "down") {
                const imageIndex = sliderData.findIndex((img) => img.publicId === imageId);
                if (imageIndex === sliderData.length - 1) return;
                const image = sliderData.splice(imageIndex, 1)[0];
                sliderData.splice(imageIndex + 1, 0, image);
                renderSlider(sliderData);
                updateSliderConfig();
            }
        } catch (error) {
            console.log(error);
        }
    };
};

prepare(async (request) => {
    handleContactInformation(request);
    handleSlider(request);
});
