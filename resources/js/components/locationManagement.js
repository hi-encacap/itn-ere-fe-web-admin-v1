module.exports = {
    city: {
        empty: () => `
            <div class="flex items-center justify-center h-full px-10 py-6 text-center">
                <div>
                    <div>Không có dữ liệu nào.</div>
                    Nhấn <strong>Thêm khu vực mới</strong> để thêm một tỉnh, thành phố mới.
                </div>
            </div>
        `,
        city: (city, selected = false) => `
            <div class="px-10 ${selected ? "bg-gray-100" : ""}" id="${city.id}">
                <div
                    class="
                        flex
                        items-center
                        justify-between
                        -mt-px
                        border-t-2 border-b-2 border-gray-100
                        py-4
                        cursor-pointer
                        hover:text-encacap-main
                    "
                >
                    <div>${city.name}</div>
                    <div class="flex items-center text-sm text-gray-400">
                        <div
                            class="
                                border-2 border-gray-300
                                rounded-md
                                px-2
                                py-1
                                cursor-pointer
                                hover:border-encacap-main hover:text-encacap-main
                            "
                            data-id="${city.id}"
                        >
                            Xoá
                        </div>
                    </div>
                </div>
            </div>
        `,
    },
    district: {
        empty: () => `
            <div class="flex items-center justify-center h-full px-10 py-6 text-center">
                <div>
                    <div>Không có dữ liệu nào.</div>
                    Nhấn <strong>Thêm khu vực mới</strong> để thêm một quận, huyện mới.
                </div>
            </div>
        `,
        district: (district, selected = false) => `
            <div class="ml-5 pl-5 pr-10 rounded-l-md ${selected ? "bg-gray-200" : ""}" id="${district.id}">
                <div
                    class="
                        flex
                        items-center
                        justify-between
                        border-gray-100
                        py-4
                        cursor-pointer
                        hover:text-encacap-main
                    "
                >
                    <div>${district.name}</div>
                    <div class="flex items-center text-sm text-gray-400">
                        <div
                            class="
                                border-2 border-gray-300
                                rounded-md
                                px-2
                                py-1
                                cursor-pointer
                                hover:border-encacap-main hover:text-encacap-main
                            "
                            data-id="${district.id}"
                        >
                            Xoá
                        </div>
                    </div>
                </div>
            </div>
        `,
    },
    ward: {
        empty: () => `
            <div class="flex items-center justify-center h-full px-10 py-6 text-center">
                <div>
                    <div>Không có dữ liệu nào.</div>
                    Nhấn <strong>Thêm khu vực mới</strong> để thêm một xã, phường, thị trấn mới.
                </div>
            </div>
        `,
        ward: (ward) => `
            <div class="ml-5 pl-5 pr-10 rounded-l-md">
                <div
                    class="
                        flex
                        items-center
                        justify-between
                        border-b-2 border-gray-100
                        py-4
                        cursor-pointer
                        hover:text-encacap-main
                    "
                >
                    <div>${ward.name}</div>
                    <div class="flex items-center text-sm text-gray-400">
                        <div
                            class="
                                border-2 border-gray-300
                                rounded-md
                                px-2
                                py-1
                                cursor-pointer
                                hover:border-encacap-main hover:text-encacap-main
                            "
                        >
                            Xoá
                        </div>
                    </div>
                </div>
            </div>
        `,
    },
    empty: (title, subTitle) => `
        <div class="flex items-center justify-center h-full px-10 py-6 text-center">
            <div>
                <div>${title}</div>
                <div>${subTitle}</div>
            </div>
        </div>
    `,
};
