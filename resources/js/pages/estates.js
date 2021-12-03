const validator = require("validator");
const prepare = require("../utils/prepare");
const EncacapForm = require("../utils/form");
const EncacapFiles = require("../utils/files");
const { generateYoutubePreview } = require("../utils/helpers");

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

prepare((request, loading) => {
    const estateForm = new EncacapForm("#estate_form");

    const youtubeInput = estateForm.querySelector("input[name=youtube]");
    const youtubeAvatarCheckbox = estateForm.querySelector("input[name=youtube_avatar]");

    const avatarContainer = estateForm.querySelector("#avatar_container");
    const avatarImagesGroup = avatarContainer.querySelector(".form-images-group");
    const avatarImage = avatarContainer.querySelector(".form-images-preview img");
    const avatarInput = avatarContainer.querySelector("input");

    const renderAvatarPreview = (file = null) => {
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
});
