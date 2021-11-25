const validator = require("validator");

class EncacapForm {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.defaultValidateMessages = {
            required: "This field is required",
            email: "Email is invalid",
        };
        this.validationRoles = {};
        this.validationRole = "";
        this.disableInputs = [];
        this.setFocusStyle();
    }

    set onsubmit(callback) {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.hideError();
            let isValid = true;
            const inputNames = Object.keys(this.validationRoles);
            const inputs = [];
            inputNames.forEach((inputName) => {
                const input = this.querySelector(`[name="${inputName}"]`);
                inputs.push(input);
                input.error.hide();
                const errorMessage = this.getValidationMessage(input, this.validationRoles[inputName]);
                if (errorMessage) {
                    input.error.show(errorMessage);
                    isValid = false;
                }
            });
            if (isValid) {
                const data = {};
                inputs.forEach((input) => {
                    const { name, value, disabled } = input;
                    data[name] = { value, disabled };
                });
                this.disable();
                callback(event, data);
            }
        });
    }

    setFocusStyle() {
        const inputs = this.querySelectorAll("[name]");
        inputs.forEach((input) => {
            const formGroup = input.closest(".form-group");
            if (!formGroup) return;
            input.addEventListener("focus", () => {
                formGroup.classList.add("focus");
            });
            input.addEventListener("blur", () => {
                formGroup.classList.remove("focus");
            });
        });
    }

    querySelector(selector) {
        const element = this.form.querySelector(selector);
        element.loading = {
            show: () => {
                let parent = element;
                while (!parent.className.includes("form-group") && parent.tagName !== "FORM") {
                    parent.classList.add("loading");
                    parent = parent.parentElement;
                }
            },
            hide: () => {
                let parent = element;
                while (!parent.className.includes("form-group") && parent.tagName !== "FORM") {
                    parent.classList.remove("loading");
                    parent = parent.parentElement;
                }
            },
        };
        element.error = {
            show: (message) => {
                const formGroup = element.closest(".form-group");
                if (!formGroup) return;
                formGroup.classList.add("error");
                const formMessage = formGroup.querySelector(".form-message");
                if (!formMessage) return;
                formMessage.innerText = message;
            },
            hide: () => {
                const formGroup = element.closest(".form-group");
                if (!formGroup) return;
                formGroup.classList.remove("error");
                const formMessage = formGroup.querySelector(".form-message");
                if (!formMessage) return;
                formMessage.innerText = "";
            },
        };
        return element;
    }

    querySelectorAll(selector) {
        return this.form.querySelectorAll(selector);
    }

    disable() {
        const inputs = this.form.querySelectorAll("[name], button");
        inputs.forEach((input) => {
            if (input.disabled) this.disableInputs.push(input.name);
            // eslint-disable-next-line no-param-reassign
            input.disabled = true;
        });
    }

    enable() {
        const inputs = this.form.querySelectorAll("[name], button");
        inputs.forEach((input) => {
            if (this.disableInputs.includes(input.name)) return;
            // eslint-disable-next-line no-param-reassign
            input.disabled = false;
        });
    }

    get validationFunction() {
        const role = this.validationRole;
        const validateFunctions = {
            required: (value) => !value.trim(),
            email: (value) => !validator.isEmail(value),
            min: (value, number) => !validator.isLength(value, { min: number }),
        };
        if (!validateFunctions[role]) throw new Error(`Validation function ${role} not found`);
        return validateFunctions[role];
    }

    getValidationMessage(input, roles) {
        const rolesLength = roles.length;
        input.error.hide();
        for (let i = 0; i < rolesLength; i += 1) {
            const role = roles[i];
            let roleValue;
            const { role: roleName, message } = role;
            if (roleName.includes("(")) {
                const [name, number] = roleName.split("(");
                roleValue = number.slice(0, -1);
                this.validationRole = name;
            } else {
                this.validationRole = roleName;
            }
            const errorMessage = this.validationFunction(input.value, roleValue);
            if (errorMessage) {
                input.error.show(message || this.defaultValidateMessages[roleName]);
                return message || this.defaultValidateMessages[roleName];
            }
        }
    }

    setValidateFunction(input, roles) {
        input.addEventListener("blur", () => this.getValidationMessage(input, roles));
    }

    showError(message, error) {
        const formNotify = this.form.querySelector(".form-notify");
        let errorMessage = `<div>${message}</div>`;
        if (typeof error === "object") {
            errorMessage += `
                <div class="mt-2 text-sm text-black font-normal">
                    <span class="font-semibold">Chi tiết:</span> ${error.stack || error.message}
                </div>
            `;
        }
        formNotify.innerHTML = errorMessage;
        formNotify.classList.remove("hidden");
    }

    hideError() {
        const formNotify = this.form.querySelector(".form-notify");
        formNotify.classList.add("hidden");
    }

    validate(options) {
        const inputNames = Object.keys(options);
        inputNames.forEach((inputName) => {
            const input = this.querySelector(`[name="${inputName}"]`);
            if (!input) throw new Error(`Input with name ${inputName} not found`);
            input.addEventListener("input", () => input.error.hide());
            let roles = options[inputName];
            if (typeof roles === "string") {
                roles = roles.split(" ").map((role) => ({ role }));
            }
            this.setValidateFunction(input, roles);
            this.validationRoles[inputName] = roles;
        });
    }
}

module.exports = EncacapForm;
