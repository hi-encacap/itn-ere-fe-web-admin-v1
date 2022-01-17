const dayjs = require("dayjs");

module.exports = (data) => {
    const element = document.createElement("div");
    element.className = "mb-4 border-2 border-gray-200 rounded-md p-4 bg-white";
    element.innerHTML = `
        <div class="text-sm">${dayjs(data.updatedAt).format("HH:mm:ss - DD/MM/YYYY")}</div>
        <div class="uppercase font-semibold pt-2">${data.title || "Bài viết không có tiêu đề"}</div>
        <div class="flex">
            <a
                href="./modify.html?id=${data.id || data._id}"
                class="
                    flex-1 flex
                    items-center
                    justify-center
                    mt-4
                    border-2 border-encacap-main
                    bg-encacap-main
                    rounded-md
                    px-3
                    py-1
                    text-white
                    font-semibold
                    cursor-pointer
                    transition-bg
                    duration-200
                    hover:bg-white hover:text-encacap-main
                "
            >
                Chỉnh sửa
            </a>
            <div
                class="
                    move-to-trash
                    flex
                    items-center
                    justify-center
                    mt-4
                    ml-4
                    border-2 border-gray-100
                    bg-gray-100
                    rounded-md
                    px-3
                    py-1
                    text-black
                    font-semibold
                    cursor-pointer
                    transition-bg
                    duration-200
                    hover:bg-gray-200
                "
                data-id="${data.id || data._id}"
                data-type="draft"
            >
                Xoá
            </div>
        </div>
    `;
    return element;
};
