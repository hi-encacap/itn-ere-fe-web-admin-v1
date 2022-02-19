class Modal {
    constructor(options) {
        this.initialize(options.html);
        this.hide = this.hide.bind(this);
    }

    initialize(html) {
        const modal = document.createElement("div");
        const body = document.querySelector("body");

        modal.className = `
            animate
            animate__fadeInDown
            fixed
            hidden
            top-0
            right-0
            bottom-0
            left-0
            z-100
            bg-black
            bg-opacity-50
        `;

        modal.innerHTML = `
            <div class="w-full max-w-mobile m-auto border-2 border-gray-100 rounded-md bg-white p-10">
                ${html}
                <button class="
                    encacap-modal-close
                    btn
                    w-full
                    mr-4
                    border-2 border-gray-200
                    bg-gray-100
                    rounded-md
                    py-2
                    text-black
                    font-semibold
                    duration-200
                    hover:bg-gray-300
                ">
                    <div class="spinner w-5 h-5 mr-4 rounded-full border-2 border-white"></div>
                    Huỷ
                </button>
            </div>
        `;

        const closeButton = modal.querySelector(".encacap-modal-close");
        closeButton.onclick = this.hide.bind(this);

        body.appendChild(modal);
        this.modal = modal;
    }

    querySelector(selector) {
        return this.modal.querySelector(selector);
    }

    hide() {
        this.modal.classList.add("hidden");
        this.modal.classList.remove("flex");
    }

    show() {
        this.modal.classList.add("flex");
        this.modal.classList.remove("hidden");
    }
}

module.exports = Modal;
