const axios = require("axios");
const EncacapForm = require("../utils/form");
const { API_GATEWAY } = require("../configs/configs");
const prepare = require("../utils/prepare");

prepare(
    () => {
        window.localStorage.removeItem("user");
        window.localStorage.removeItem("tokens");

        const loginForm = new EncacapForm(".form");
        const loginButton = loginForm.querySelector("button[type=submit]");

        loginForm.validate({
            email: [
                { role: "required", message: "Địa chỉ Email không được phép để trống" },
                { role: "email", message: "Địa chỉ Email không hợp lệ" },
            ],
            password: [
                { role: "required", message: "Mật khẩu không được phép để trống" },
                { role: "min(6)", message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ],
        });

        loginForm.onsubmit = async (event, data) => {
            event.preventDefault();
            loginButton.loading.show();
            try {
                const response = await axios.post(`${API_GATEWAY}/auth/login`, {
                    email: data.email.value,
                    password: data.password.value,
                });
                const { user, tokens } = response.data;
                window.localStorage.setItem("user", JSON.stringify(user));
                window.localStorage.setItem("tokens", JSON.stringify(tokens));
                window.location.href = "/";
            } catch (error) {
                const { response } = error;
                if (response) {
                    const { status } = response;
                    if (status === 401) {
                        loginForm.showError("Địa chỉ Email hoặc mật khẩu không chính xác!");
                        loginButton.loading.hide();
                        loginForm.enable();
                    }
                } else {
                    loginForm.showError("Đã có lỗi xảy ra, vui lòng thử lại sau!", error);
                }
            }
        };
    },
    {
        isVerify: false,
    }
);
