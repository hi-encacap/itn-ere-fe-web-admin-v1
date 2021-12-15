module.exports = (data) => {
    const element = document.createElement("div");
    element.className = "items flex flex-col rounded-md border-2 border-gray-100 p-4 hover:border-encacap-main";
    element.innerHTML = `
        <div class="h-32 bg-gray-100">
            <img
                src="${data.avatar.thumbnail}"
                class="w-full h-full object-cover object-center rounded-md"
                alt="${data.title}"
            />
        </div>
        <div class="flex-1">
            <div class="flex flex-wrap mt-4">
                <div
                    class="
                        mr-2
                        mb-2
                        rounded-full
                        border-2 border-gray-100
                        bg-gray-50
                        px-2
                        py-px
                        font-semibold
                        text-sm text-gray-400
                    "
                >
                    # ${data.customId}
                </div>
                <div
                    class="
                        mr-4
                        mb-2
                        rounded-full
                        border-2 border-gray-100
                        bg-gray-50
                        px-2
                        py-px
                        font-semibold
                        text-sm text-gray-400
                    "
                >
                    ${data.category.name}
                </div>
            </div>
            <div class="mt-2 uppercase font-semibold line-clamp-2">
                ${data.title}
            </div>
            <div class="mb-1 md:mb-2 md:mt-2 line-clamp-1">
                <span>${data.price}</span>
                <span class="px-1 text-gray-400">·</span>
                <span>${data.area}</span>
                <span class="px-1 text-gray-400">·</span>
                <span>${data.location.city.name}</span>
            </div>
        </div>
        <div>
            <div>
                <a
                    href="./modify.html?id=${data.id}"
                    class="
                        flex
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
            </div>
            <div class="flex">
                <div
                    class="
                        move-to-top
                        flex-1 flex
                        items-center
                        justify-center
                        mt-4
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
                    data-id="${data.id}"
                >
                    <div class="spinner hidden w-4 h-4 mr-2 rounded-full border-2 border-black"></div>
                    Đưa lên đầu
                </div>
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
                    data-id="${data.id}"
                >
                    Xoá
                </div>
            </div>
        </div>
    `;
    return element;
};
