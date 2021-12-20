module.exports = (data) => {
    const element = document.createElement("div");
    element.className = "mb-4 border-2 border-gray-100 rounded-md p-4";
    element.innerHTML = `
        <div class="w-full h-40 bg-gray-100">
            <img
                src="${data.url}"
                class="w-full h-full object-cover object-center rounded-md"
                alt="Slider 01"
            />
        </div>
        <div>
            <div class="flex">
                <div
                    class="
                        button
                        flex-1 flex
                        items-center
                        justify-center
                        mt-4
                        mr-2
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
                    data-id="${data.publicId}"
                    data-action="up"
                >
                    <div
                        class="spinner hidden w-4 h-4 mr-2 rounded-full border-2 border-black"
                    ></div>
                    Đưa lên
                </div>
                <div
                    class="
                        button
                        flex-1 flex
                        items-center
                        justify-center
                        mt-4
                        ml-2
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
                    data-id="${data.publicId}"
                    data-action="down"
                >
                    <div
                        class="spinner hidden w-4 h-4 mr-2 rounded-full border-2 border-black"
                    ></div>
                    Đưa xuống
                </div>
            </div>
            <div
                class="
                    button
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
                data-id="${data.publicId}"
                data-action="delete"
            >
                <div class="spinner hidden w-4 h-4 mr-2 rounded-full border-2 border-black"></div>
                Xoá
            </div>
        </div>
    `;
    return element;
};
