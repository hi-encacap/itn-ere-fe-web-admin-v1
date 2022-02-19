module.exports = () => `
    <form class="form -mt-4 mb-4" id="encacap_upload_form">
        <div class="form-header">
            <div class="font-semibold">
                <div class="mt-2 pb-6">Tải lên hình ảnh</div>
                <div class="w-20 h-1 mt-1 rounded-md bg-gray-100"></div>
            </div>
            <div class="form-body pt-8">
                <div class="form-notify"></div>
                <div class="form-group border-2 border-gray-100 rounded-md px-6 pt-5 pb-4">
                    <label for="encacap_upload_url" class="block font-semibold text-gray-500 text-sm">
                        Nhập URL hình ảnh
                    </label>
                    <input
                        name="encacap_upload_url"
                        id="encacap_upload_url"
                        class="w-full mt-2 mb-1 outline-none text-black"
                        placeholder="VD: https://www.example.com/image.jpg"
                    />
                    <div class="form-message mt-1.5 mb-1 text-sm"></div>
                    <div class="form-overlay"></div>
                    <div class="form-loading"></div>
                </div>
                <div class="form-group mt-4" id="encacap_upload_file_container">
                    <label for="encacap_upload_file"> Hoặc chọn hình ảnh từ thiết bị </label>
                    <div class="relative">
                        <input
                            type="file"
                            name="encacap_upload_file"
                            id="encacap_upload_file"
                            placeholder="Nhập giá bán hoặc giá thuê BĐS"
                            class="hidden"
                            accept="image/png, image/jpg, image/jpeg"
                        />
                        <div class="form-images-group pb-1.5">
                            <label for="encacap_upload_file" class="form-images-button">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    class="form-images-add w-8"
                                >
                                    <path
                                        d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10ZM8 12h8M12 16V8"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    ></path>
                                </svg>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    class="form-images-change w-8"
                                >
                                    <path
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                        d="M9.11 5.08c.87-.26 1.83-.43 2.89-.43 4.79 0 8.67 3.88 8.67 8.67s-3.88 8.67-8.67 8.67-8.67-3.88-8.67-8.67c0-1.78.54-3.44 1.46-4.82M7.87 5.32L10.76 2M7.87 5.32l3.37 2.46"
                                    ></path>
                                </svg>
                            </label>
                            <div class="form-images-preview">
                                <img src="/assets/images/encacap_logo.svg" alt="Avatar" />
                            </div>
                        </div>
                    </div>
                    <div class="form-message"></div>
                </div>
            </div>
        </div>
        <button type="submit" class="
                btn
                mt-4        
                w-full
                border-2 border-encacap-main
                bg-encacap-main
                rounded-md
                py-2
                text-white
                font-semibold
                duration-200
                hover:bg-encacap-main-dark
        ">
            <div class="spinner w-5 h-5 mr-4 rounded-full border-2 border-white"></div>
            Xác nhận
        </button>
    </form>
`;
