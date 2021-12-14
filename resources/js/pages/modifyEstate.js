const validator = require("validator");
const axios = require("axios");
const prepare = require("../utils/prepare");
const EncacapForm = require("../utils/form");
const EncacapFiles = require("../utils/files");
// const EncacapModal = require("../utils/modal");
const { generateYoutubePreview, handleURL } = require("../utils/helpers");

const createPreviewImage = (file) => {
    if (!file) return;
    if (typeof file === "object") {
        if (file.lastModified) {
            return URL.createObjectURL(file);
        }
    } else if (typeof file === "string") {
        if (file.includes("youtube")) {
            return generateYoutubePreview(file);
        }
    }
};

const createOption = (value, text, selected) => {
    const option = document.createElement("option");
    option.value = value;
    option.innerText = text;
    if (selected) {
        option.selected = true;
    }
    return option;
};

const renderOptions = (select, options, selected) => {
    const selectElement = select;
    const defaultOption = selectElement.querySelector("option[value='']");
    selectElement.innerHTML = "";
    if (!selected) {
        defaultOption.selected = true;
        selectElement.appendChild(defaultOption);
    }
    options.forEach((option) => {
        const { id, name } = option;
        const optionElement = createOption(id, name, id === selected);
        selectElement.appendChild(optionElement);
    });
};

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

prepare(async (request) => {
    const estateForm = new EncacapForm("#estate_form");

    // const estateId = handleURL(window.location.href).query("id");
    const notification = handleURL(window.location.href).query("notification");

    if (notification) {
        estateForm.showSuccess(notification);
    }

    estateForm.validate({
        city: [
            {
                role: "required",
                message: "Tỉnh, thành phố không được phép để trống",
            },
        ],
        district: [
            {
                role: "required",
                message: "Quận, huyện không được phép để trống",
            },
        ],
        ward: [
            {
                role: "required",
                message: "Xã, phường, thị trấn không được phép để trống",
            },
        ],
        title: [
            {
                role: "required",
                message: "Tiêu đề không được phép để trống",
            },
        ],
        price: [
            {
                role: "required",
                message: "Giá bán không được phép để trống",
            },
        ],
        area: [
            {
                role: "required",
                message: "Diện tích không được phép để trống",
            },
        ],
        category: [
            {
                role: "required",
                message: "Danh mục không được phép để trống",
            },
        ],
        contact_name: [
            {
                role: "required",
                message: "Thông tin liên hệ không được phép để trống",
            },
        ],
        contact_phone: [
            {
                role: "required",
                message: "Số điện thoại không được phép để trống",
            },
        ],
    });

    /**
     * Tạo hiệu ứng cho cái nút ở cuối form
     */

    const formActions = estateForm.querySelector(".footer");

    formActions.classList.add("flex");
    formActions.classList.remove("hidden");
    formActions.style.width = `${estateForm.getForm().offsetWidth}px`;

    /**
     * Xử lý khi người dùng chọn vị trí cho bất động sản
     */

    const citySelect = estateForm.querySelector("select[name=city]");
    const districtSelect = estateForm.querySelector("select[name=district]");
    const wardSelect = estateForm.querySelector("select[name=ward]");

    const getWards = async (cityId, districtId) => {
        wardSelect.loading.show();
        wardSelect.disable();
        try {
            const { data: wards } = await request.get(`locations/${cityId}/${districtId}/wards`);
            renderOptions(wardSelect, wards);
            wardSelect.loading.hide();
            wardSelect.enable();
        } catch (error) {
            estateForm.showError("Đã xảy ra lỗi khi tải dữ liệu xã, phường, thị trấn.", error?.response.data || error);
        }
    };

    const getDistricts = async (cityId) => {
        districtSelect.loading.show();
        districtSelect.disable();
        try {
            const { data: districts } = await request.get(`locations/${cityId}/districts`);
            renderOptions(districtSelect, districts);
            districtSelect.loading.hide();
            districtSelect.enable();
        } catch (error) {
            estateForm.showError("Đã xảy ra lỗi khi tải dữ liệu quận, huyện.", error?.response.data || error);
        }
    };

    const getCities = async () => {
        citySelect.loading.show();
        citySelect.disable();
        try {
            const { data: cities } = await request.get("locations/cities");
            renderOptions(citySelect, cities);
            citySelect.loading.hide();
            citySelect.enable();
        } catch (error) {
            estateForm.showError("Đã xảy ra lỗi khi tải dữ liệu tỉnh, thành phố.", error?.response.data || error);
        }
    };

    districtSelect.disable();
    wardSelect.disable();

    getCities();

    citySelect.onchange = () => {
        const cityId = citySelect.value;
        if (!cityId) {
            return;
        }
        getDistricts(cityId);
    };

    districtSelect.onchange = () => {
        const cityId = citySelect.value;
        const districtId = districtSelect.value;
        if (!cityId || !districtId) {
            return;
        }
        getWards(cityId, districtId);
    };

    /**
     * Xử lý khi người dùng chọn danh mục cho BĐS
     */

    const categorySelect = estateForm.querySelector("select[name=category]");
    const resortContainer = estateForm.querySelector("#resort");
    const groundContainer = estateForm.querySelector("#ground");

    const hiddenSubcategory = () => {
        resortContainer.classList.add("hidden");
        groundContainer.classList.add("hidden");
    };

    const showSubcategory = (category) => {
        if (category === "nghi-duong" || category === "nha-pho") {
            resortContainer.classList.remove("hidden");
        } else if (category === "dat-nen") {
            groundContainer.classList.remove("hidden");
        }
    };

    categorySelect.onchange = () => {
        hiddenSubcategory();
        const category = categorySelect.value;
        if (category) {
            showSubcategory(category);
        }
    };

    /**
     * Xử lý khi người dùng chọn hình ảnh cho BĐS
     */

    const youtubeInput = estateForm.querySelector("input[name=youtube]");
    const youtubeAvatarCheckbox = estateForm.querySelector("input[name=youtube_avatar]");

    const avatarContainer = estateForm.querySelector("#avatar_container");
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

    const imagesContainer = estateForm.querySelector("#images_container");
    const imagesInput = imagesContainer.querySelector("input");
    const imagesPreviewContainer = imagesContainer.querySelector("#images_preview_container");

    const imageFiles = new EncacapFiles();

    const clearImagesPreview = () => {
        const elements = imagesPreviewContainer.children;
        Array.from(elements).forEach((element) => {
            if (element.tagName === "DIV") {
                element.remove();
            }
        });
    };

    const renderImagesPreview = () => {
        const images = imageFiles.getFiles();
        clearImagesPreview();
        if (images.length > 0) {
            imagesPreviewContainer.classList.add("has-items");
        } else {
            imagesPreviewContainer.classList.remove("has-items");
        }
        images.forEach((image) => {
            const imagePreview = document.createElement("div");
            imagePreview.classList.add("form-images-preview");
            imagePreview.dataset.id = image.id;
            imagePreview.innerHTML = `
                <img src="${createPreviewImage(image)}" />
                <div class="form-images-preview-remove">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10ZM8 12h8M12 16V8"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></path>
                    </svg>
                </div>
            `;
            imagesPreviewContainer.appendChild(imagePreview);
        });
    };

    imagesPreviewContainer.onclick = (event) => {
        const { target } = event;
        const removeButton = target.closest(".form-images-preview-remove");
        const imagePreview = target.closest(".form-images-preview");
        if (!removeButton) return;
        const imageId = imagePreview.dataset.id;
        imageFiles.remove(imageId);
        renderImagesPreview(imageId);
    };

    // Disable youtube avatar checkbox if youtube input is empty
    youtubeAvatarCheckbox.disable();

    youtubeAvatarCheckbox.onchange = () => {
        const isChecked = youtubeAvatarCheckbox.checked;
        if (!isChecked) {
            const avatarFile = avatarInput.files[0];
            if (!avatarFile) {
                renderAvatarPreview();
            } else {
                renderAvatarPreview(avatarFile);
            }
            return;
        }
        renderAvatarPreview(youtubeInput.value);
    };

    youtubeInput.oninput = () => {
        const youtubeURL = youtubeInput.value;
        if (!validator.isURL(youtubeURL)) {
            renderAvatarPreview();
            youtubeAvatarCheckbox.checked = false;
            youtubeAvatarCheckbox.disable();
            return;
        }
        youtubeAvatarCheckbox.enable();
    };

    avatarInput.onchange = () => {
        const avatarFile = avatarInput.files[0];
        if (!avatarFile) return;
        youtubeAvatarCheckbox.checked = false;
        renderAvatarPreview(avatarFile);
    };

    imagesInput.oninput = () => {
        const images = imagesInput.files;
        let isRerenderPreview = false;
        for (let i = 0; i < images.length; i += 1) {
            const file = images[i];
            isRerenderPreview = imageFiles.push(file);
        }
        if (isRerenderPreview) {
            renderImagesPreview();
        }
    };

    /**
     * Xử lý khi nhấn nút đăng tin
     */

    const submitButton = estateForm.querySelector("button[type=submit]");

    // const progressModel = new EncacapModal("#progressModel");
    // const signatureProgressElement = document.querySelector("#signature_progress");
    // const avatarProgressElement = document.querySelector("#avatar_progress");
    // const imagesProgressElement = document.querySelector("#images_progress");
    // const saveProgressElement = document.querySelector("#save_progress");
    // const loadingElement = `<div class="spinner w-4 h-4 border-2 border-encacap-main rounded-full"></div>`;
    // const successElement = `<div class="w-4 h-4 rounded-full border-2 border-green-500 bg-green-500"></div>`;
    // const errorElement = `<div class="w-4 h-4 rounded-full border-2 border-red-500 bg-red-500"></div>`;

    let estateData = {
        avatar: {},
        pictures: [],
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

    estateForm.onsubmit = async (event, data) => {
        const unexpectedKeys = ["avatar", "images", "youtube_avatar"];
        estateData = Object.assign(
            estateData,
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

        submitButton.loading.show();

        // Kiểm tra xem có ảnh đại diện không
        if (!youtubeAvatarCheckbox.checked && avatarInput.files.length === 0) {
            submitButton.loading.hide();
            avatarInput.error.show("Ảnh đại diện không được phép để trống");
            estateForm.enable();
            return;
        }

        // Kiểm tra xem Mã bất động sản có bị trùng không
        if (estateData.estate_id) {
            const customEstateId = estateData.estate_id;
            try {
                const { data: estate } = await request.get(`estates/${customEstateId}`);
                if (estate) {
                    const customIdInput = estateForm.querySelector("#estate_id");
                    customIdInput.error.show("Mã bất động sản đã tồn tại");
                    estateForm.enable();
                    submitButton.loading.hide();
                    return;
                }
            } catch (error) {
                const errorStatus = error?.response.status;
                if (errorStatus !== 404) {
                    estateForm.showError(
                        "Đã xảy ra lỗi khi kiểm tra tính khả dụng của 'Mã BĐS'",
                        error?.response.data || error
                    );
                    estateForm.enable();
                    submitButton.loading.hide();
                    return;
                }
            }
        }

        let signature;

        try {
            const { data: response } = await request.get("images/signature");
            signature = response;
        } catch (error) {
            estateForm.showError("Đã xảy ra lỗi khi kết nối với máy chủ.", error?.response.data || error);
            estateForm.enable();
            submitButton.loading.hide();
            return;
        }

        if (avatarInput.files.length > 0 && !youtubeAvatarCheckbox.checked) {
            try {
                const { data: avatarResponse } = await uploadImage(avatarInput.files[0], signature);
                estateData.avatar = normalizeImageData({ ...avatarResponse, ...signature });
            } catch (error) {
                estateForm.showError("Đã xảy ra lỗi khi tải lên ảnh đại diện.", error?.response.data || error);
                estateForm.enable();
                submitButton.loading.hide();
                return;
            }
        } else {
            const youtubeURL = youtubeInput.value;
            estateData.avatar = normalizeImageData(youtubeURL);
        }

        if (imageFiles.length > 0) {
            try {
                const imageResponses = await Promise.all(imageFiles.files.map((file) => uploadImage(file, signature)));
                estateData.pictures = imageResponses.map((imageResponse) =>
                    normalizeImageData({ ...imageResponse.data, ...signature })
                );
            } catch (error) {
                estateForm.showError("Đã xảy ra lỗi khi tải lên ảnh.", error?.response.data || error);
                estateForm.enable();
                submitButton.loading.hide();
                return;
            }
        }
        try {
            const { data: responses } = await request.post("estates", estateData);
            window.location.href = `./modify.html?id=${responses.id}&notification=Đã+xuất+bản+bài+viết+thành+công`;
        } catch (error) {
            estateForm.showError("Đã xảy ra lỗi khi lưu thông tin bài viết.", error?.response.data || error);
            estateForm.enable();
            submitButton.loading.hide();
            // Phải xoá ảnh đại diện và ảnh bổ sung để không bị lưu lại
        }
    };
});
