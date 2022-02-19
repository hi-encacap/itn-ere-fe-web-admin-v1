const validator = require("validator");
const uploadForm = require("../components/UploadForm");
const Modal = require("./modal.v2");
const EncacapForm = require("./form");
const { createPreviewImage } = require("./helpers");

class Upload {
    constructor() {
        this.initialize();
    }

    initialize() {
        const modal = new Modal({
            html: uploadForm(),
        });

        const form = new EncacapForm("#encacap_upload_form");

        const submitButton = form.querySelector("button[type=submit]");
        const urlInput = form.querySelector("input[name=encacap_upload_url]");
        const fileInput = form.querySelector("input[name=encacap_upload_file]");

        const imageContainer = form.querySelector("#encacap_upload_file_container");
        const imageImagesGroup = imageContainer.querySelector(".form-images-group");
        const imageImage = imageContainer.querySelector(".form-images-preview img");

        const renderImagePreview = (file = null) => {
            fileInput.error.hide();
            if (!file) {
                imageImagesGroup.classList.remove("has-items");
                return;
            }
            imageImage.src = createPreviewImage(file);
            imageImagesGroup.classList.add("has-items");
        };

        const handleInput = () => {
            const url = urlInput.value;
            const file = fileInput.files[0];
            if (!file) {
                if (!url || !validator.isURL(url)) {
                    submitButton.disable();
                    fileInput.enable();
                    return;
                }
                fileInput.disable();
            } else {
                renderImagePreview(file);
                urlInput.disable();
            }
            submitButton.enable();
        };

        submitButton.disable();

        urlInput.oninput = handleInput;
        fileInput.oninput = handleInput;

        form.onsubmit = (event) => {
            event.preventDefault();
            const file = fileInput.files[0];

            if (file) {
                modal.hide();
                this.uploadCallback(file);
            }
        };

        this.modal = modal;
        this.form = form;
    }

    upload(callback) {
        this.modal.show();
        this.uploadCallback = callback;
    }
}

module.exports = Upload;
