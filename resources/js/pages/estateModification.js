const validator = require("validator");
const axios = require("axios");
const SimpleMDE = require("simplemde");
const prepare = require("../utils/prepare");
const EncacapForm = require("../utils/form");
const EncacapFiles = require("../utils/files");
// const EncacapModal = require("../utils/modal");
const { createPreviewImage, handleURL } = require("../utils/helpers");
const { normalizeImageData } = require("../utils/cloudinary");

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

prepare(async (request) => {
    const estateForm = new EncacapForm("#estate_form");

    const estateId = handleURL(window.location.href).query("id");
    let savedEstateCustomId = 0;
    const notification = handleURL(window.location.href).query("notification");

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

    let estateData = {
        avatar: {},
        pictures: [],
    };

    if (notification) {
        if (notification === "published") {
            estateForm.showSuccess("Bài viết đã được xuất bản.");
        }
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

    const simpleMDE = new SimpleMDE({
        element: estateForm.querySelector("#description"),
        spellChecker: false,
        hideIcons: ["image", "side-by-side", "fullscreen"],
    });

    /**
     * Tạo hiệu ứng cho cái nút ở cuối biểu mẫu & Đổ dữ liệu luôn, tại lỡ rồi =))
     */

    const formActions = estateForm.querySelector(".footer");
    const submitButton = estateForm.querySelector("button[type=submit]");
    const secondaryButton = estateForm.querySelector("button[type=button]");

    const estateIdInput = estateForm.querySelector("input[name=estate_id]");
    const streetInput = estateForm.querySelector("input[name=street]");
    const titleInput = estateForm.querySelector("input[name=title]");
    const priceInput = estateForm.querySelector("input[name=price]");
    const areaInput = estateForm.querySelector("input[name=area]");
    const categorySelect = estateForm.querySelector("select[name=category]");
    const livingRoomInput = estateForm.querySelector("input[name=living_room]");
    const bedroomInput = estateForm.querySelector("input[name=bedroom]");
    const bathroomInput = estateForm.querySelector("input[name=bathroom]");
    const pageInput = estateForm.querySelector("input[name=page]");
    const plotInput = estateForm.querySelector("input[name=plot]");
    const directionSelect = estateForm.querySelector("select[name=direction]");
    const contactNameInput = estateForm.querySelector("input[name=contact_name]");
    const contactPhoneInput = estateForm.querySelector("input[name=contact_phone]");

    const youtubeInput = estateForm.querySelector("input[name=youtube]");
    const youtubeAvatarCheckbox = estateForm.querySelector("input[name=youtube_avatar]");

    const avatarContainer = estateForm.querySelector("#avatar_container");
    const avatarImagesGroup = avatarContainer.querySelector(".form-images-group");
    const avatarImage = avatarContainer.querySelector(".form-images-preview img");
    const avatarInput = avatarContainer.querySelector("input");

    // Xử lý vị trí

    const citySelect = estateForm.querySelector("select[name=city]");
    const districtSelect = estateForm.querySelector("select[name=district]");
    const wardSelect = estateForm.querySelector("select[name=ward]");

    const getWards = async (cityId, districtId, selectedWard) => {
        wardSelect.loading.show();
        wardSelect.disable();
        try {
            const { data: wards } = await request.get(`locations/${cityId}/${districtId}/wards`);
            renderOptions(wardSelect, wards, selectedWard);
            wardSelect.loading.hide();
            wardSelect.enable();
        } catch (error) {
            estateForm.showError("Đã xảy ra lỗi khi tải dữ liệu xã, phường, thị trấn.", error?.response.data || error);
        }
    };

    const getDistricts = async (cityId, selectedDistrict) => {
        districtSelect.loading.show();
        districtSelect.disable();
        try {
            const { data: districts } = await request.get(`locations/${cityId}/districts`);
            renderOptions(districtSelect, districts, selectedDistrict);
            districtSelect.loading.hide();
            districtSelect.enable();
        } catch (error) {
            estateForm.showError("Đã xảy ra lỗi khi tải dữ liệu quận, huyện.", error?.response.data || error);
        }
    };

    const getCities = async (selectedCity = undefined) => {
        citySelect.loading.show();
        citySelect.disable();
        try {
            const { data: cities } = await request.get("locations/cities");
            renderOptions(citySelect, cities, selectedCity);
            citySelect.loading.hide();
            citySelect.enable();
        } catch (error) {
            estateForm.showError("Đã xảy ra lỗi khi tải dữ liệu tỉnh, thành phố.", error?.response.data || error);
        }
    };

    districtSelect.disable();
    wardSelect.disable();

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

    formActions.classList.remove("footer--hide");
    formActions.style.width = `${estateForm.getForm().offsetWidth}px`;

    if (estateId) {
        try {
            const { data } = await request.get(`estates/${estateId}`);
            estateData = data;
        } catch (error) {
            estateForm.disable();
            estateForm.showError("Đã xảy ra lỗi khi tìm kiếm thông tin bài viết.", error.response?.data || error);
        }
    }

    if (estateId) {
        const {
            customId,
            location,
            title = "",
            price = "",
            area = "",
            category,
            properties,
            contact,
            description,
            youtube,
            avatar,
            pictures,
        } = estateData;

        const propertiesObject = properties.reduce((acc, property) => {
            const { name, value } = property;
            acc[name] = value;
            return acc;
        }, {});

        estateIdInput.value = customId;
        savedEstateCustomId = customId;

        const { city, district, ward } = location;

        if (city) {
            getCities(city.cityId);
            if (district) {
                getDistricts(city.cityId, district.districtId);
                if (ward) getWards(city.cityId, district.districtId, ward.wardId);
            }
        }

        streetInput.value = location.street;

        titleInput.value = title;
        priceInput.value = price;
        areaInput.value = area;

        categorySelect.value = category.slug;
        showSubcategory(category.slug);

        livingRoomInput.value = propertiesObject.living_room;
        bedroomInput.value = propertiesObject.bedroom;
        bathroomInput.value = propertiesObject.bathroom;
        pageInput.value = propertiesObject.page;
        plotInput.value = propertiesObject.plot;

        directionSelect.value = propertiesObject.direction || "";

        contactNameInput.value = contact.name;
        contactPhoneInput.value = contact.phone;

        if (youtube) {
            youtubeInput.value = youtube;
            youtubeAvatarCheckbox.enable();
        } else {
            youtubeAvatarCheckbox.disable();
        }

        if (avatar.resourceType === "video") {
            youtubeAvatarCheckbox.checked = true;
            renderAvatarPreview(avatar);
        } else if (avatar.resourceType === "image") {
            renderAvatarPreview(avatar);
        }

        if (pictures.length > 0) {
            pictures.forEach((picture) => imageFiles.push(picture));
            renderImagesPreview();
        }

        submitButton.innerText = "Cập nhật";

        if (estateData.isPublished) {
            submitButton.dataset.action = "save";
            secondaryButton.style.display = "none";
        } else {
            submitButton.dataset.action = "save";
            secondaryButton.innerText = "Xuất bản";
            secondaryButton.dataset.action = "publish";
        }

        if (description) simpleMDE.value(description);
    }

    if (!estateId) {
        getCities();
    }

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

    imagesPreviewContainer.onclick = (event) => {
        const { target } = event;
        const removeButton = target.closest(".form-images-preview-remove");
        const imagePreview = target.closest(".form-images-preview");
        if (!removeButton) return;
        const imageId = imagePreview.dataset.id;
        imageFiles.remove(imageId);
        const { pictures: estatePictures } = estateData;
        estateData.pictures = estatePictures.filter((picture) => picture.publicId !== imageId);
        renderImagesPreview(imageId);
    };

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

    // const progressModel = new EncacapModal("#progressModel");
    // const signatureProgressElement = document.querySelector("#signature_progress");
    // const avatarProgressElement = document.querySelector("#avatar_progress");
    // const imagesProgressElement = document.querySelector("#images_progress");
    // const saveProgressElement = document.querySelector("#save_progress");
    // const loadingElement = `<div class="spinner w-4 h-4 border-2 border-encacap-main rounded-full"></div>`;
    // const successElement = `<div class="w-4 h-4 rounded-full border-2 border-green-500 bg-green-500"></div>`;
    // const errorElement = `<div class="w-4 h-4 rounded-full border-2 border-red-500 bg-red-500"></div>`;

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

    const enableForm = () => {
        estateForm.enable();
        submitButton.loading.hide();
        submitButton.enable();
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
            }, {}),
            { description: simpleMDE.value() }
        );

        submitButton.loading.show();

        // Kiểm tra xem có ảnh đại diện không
        if (!youtubeAvatarCheckbox.checked && avatarInput.files.length === 0 && !estateId) {
            avatarInput.error.show("Ảnh đại diện không được phép để trống");
            enableForm();
            return;
        }

        // Thiếu trường hợp đổi từ Youtube sang ảnh

        // Kiểm tra xem Mã bất động sản có bị trùng không
        if (estateData.estate_id !== savedEstateCustomId) {
            const customEstateId = estateData.estate_id;
            try {
                const { data: estate } = await request.get(`estates/${customEstateId}`);
                if (estate) {
                    const customIdInput = estateForm.querySelector("#estate_id");
                    customIdInput.error.show("Mã bất động sản đã tồn tại");
                    enableForm();
                    return;
                }
            } catch (error) {
                const errorStatus = error?.response.status;
                if (errorStatus !== 404) {
                    estateForm.showError(
                        "Đã xảy ra lỗi khi kiểm tra tính khả dụng của 'Mã BĐS'",
                        error?.response.data || error
                    );
                    enableForm();
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
            enableForm();
            return;
        }

        if (avatarInput.files.length > 0 && !youtubeAvatarCheckbox.checked) {
            try {
                const { data: avatarResponse } = await uploadImage(avatarInput.files[0], signature);
                estateData.avatar = normalizeImageData({ ...avatarResponse, ...signature });
            } catch (error) {
                estateForm.showError("Đã xảy ra lỗi khi tải lên ảnh đại diện.", error?.response.data || error);
                enableForm();
                return;
            }
        } else if (youtubeAvatarCheckbox.checked) {
            const youtubeURL = youtubeInput.value;
            estateData.avatar = normalizeImageData(youtubeURL);
        }

        if (imageFiles.getTrueFile().length > 0) {
            try {
                const imageResponses = await Promise.all(
                    imageFiles.getTrueFile().map((file) => uploadImage(file, signature))
                );
                const { pictures: estatePictures } = estateData;
                estateData.pictures = [
                    ...estatePictures,
                    ...imageResponses.map((imageResponse) =>
                        normalizeImageData({ ...imageResponse.data, ...signature })
                    ),
                ];
            } catch (error) {
                estateForm.showError("Đã xảy ra lỗi khi tải lên ảnh.", error?.response.data || error);
                enableForm();
                return;
            }
        }

        try {
            if (!estateId) {
                const { data: responses } = await request.post("estates", estateData);
                window.location.href = `./modify.html?id=${responses.id}&notification=published`;
                return;
            }
            await request.patch(`estates/${estateId}`, estateData);
            window.location.href = `./modify.html?id=${estateId}&notification=saved`;
        } catch (error) {
            estateForm.showError("Đã xảy ra lỗi khi lưu thông tin bài viết.", error?.response.data || error);
            enableForm();
            // Phải xoá ảnh đại diện và ảnh bổ sung để không bị lưu lại
        }
    };
});
