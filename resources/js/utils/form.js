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
    }

    set onsubmit(callback) {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            let isValid = true;
            const inputNames = Object.keys(this.validationRoles);
            const inputs = [];
            inputNames.forEach((inputName) => {
                const input = this.querySelector(`[name="${inputName}"]`);
                inputs.push(input);
                const errorMessage = this.getValidationMessage(input, this.validationRoles[inputName]);
                if (errorMessage) {
                    this.showError(input, errorMessage);
                    isValid = false;
                }
            });
            if (isValid) {
                const data = {};
                inputs.forEach((input) => {
                    const { name, value, disabled } = input;
                    data[name] = { value, disabled };
                });
                callback(event, data);
            }
        });
    }

    querySelector(selector) {
        return this.form.querySelector(selector);
    }

    get validationFunction() {
        const role = this.validationRole;
        const validateFunctions = {
            required: (value) => !value.trim(),
            email: (value) => !validator.isEmail(value),
        };
        if (!validateFunctions[role]) throw new Error(`Validation function ${role} not found`);
        return validateFunctions[role];
    }

    getValidationMessage(input, roles) {
        const rolesLength = roles.length;
        for (let i = 0; i < rolesLength; i += 1) {
            const role = roles[i];
            const { role: roleName, message } = role;
            this.validationRole = roleName;
            const errorMessage = this.validationFunction(input.value);
            if (errorMessage) {
                this.showError(input, message || this.defaultValidateMessages[roleName]);
                return message || this.defaultValidateMessages[roleName];
            }
        }
    }

    setValidateFunction(input, roles) {
        input.addEventListener("blur", () => this.getValidationMessage(input, roles));
    }

    showError(input, message) {
        if (input && typeof input !== "string") {
            const formGroup = input.closest(".form-group");
            if (!formGroup) throw new Error("Form group not found");
            const formMessage = formGroup.querySelector(".form-message");
            if (!formMessage) throw new Error("Form message not found");
            formMessage.innerText = message;
            formGroup.classList.add("danger");
            return;
        }
        const formNotify = this.form.querySelector(".form-notify");
        formNotify.innerText = message;
        formNotify.classList.remove("hidden");
    }

    hideError(input) {
        if (input && typeof input !== "string") {
            const formGroup = input.closest(".form-group");
            if (!formGroup) throw new Error("Form group not found");
            const formMessage = formGroup.querySelector(".form-message");
            if (!formMessage) throw new Error("Form message not found");
            formGroup.classList.remove("danger");
            return;
        }
        const formNotify = this.form.querySelector(".form-notify");
        formNotify.classList.add("hidden");
    }

    validate(options) {
        const inputNames = Object.keys(options);
        inputNames.forEach((inputName) => {
            const input = this.querySelector(`[name="${inputName}"]`);
            if (!input) throw new Error(`Input with name ${inputName} not found`);
            input.addEventListener("input", () => this.hideError(input));
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
