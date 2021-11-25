class Modal {
    constructor(selector) {
        this.modal = document.querySelector(selector);
        this.close = this.modal.querySelector(".modal-close");
        if (this.close) {
            this.close.addEventListener("click", () => {
                this.hide();
            });
        }
    }

    querySelector(selector) {
        return this.modal.querySelector(selector);
    }

    show() {
        const { modal } = this;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }

    hide() {
        const { modal } = this;
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

module.exports = Modal;
