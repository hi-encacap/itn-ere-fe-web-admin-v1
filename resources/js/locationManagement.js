const EncacapForm = require("./utils/form");

(() => {
    const loginForm = new EncacapForm(".form");
    // const usernameInput = loginForm.querySelector("#email");
    loginForm.validate({
        email: [
            { role: "required", message: "Địa chỉ Email không được phép để trống" },
            { role: "email", message: "Địa chỉ Email không hợp lệ" },
        ],
        password: "required",
    });
    loginForm.onsubmit = (event, data) => {
        event.preventDefault();
        console.log(data);
    };
})();
