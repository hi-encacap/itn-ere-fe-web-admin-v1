const prepare = require("../utils/prepare");
const EncacapModal = require("../utils/modal");
const EncacapForm = require("../utils/form");
const EstateItem = require("../components/EstateItem");

prepare(async (request) => {
    const estatesContainer = document.querySelector("#estates_container");
    const searchInput = document.querySelector("#search");
    let estates = [];

    const renderEstates = (data = estates) => {
        estatesContainer.innerHTML = "";
        data.forEach((estate) => {
            const estateItem = EstateItem(estate);
            estatesContainer.appendChild(estateItem);
        });
    };

    const getEstates = async (params) => {
        try {
            const { data } = await request.get("estates", {
                params: { limit: 100000, sortBy: "priority:desc", ...params },
            });
            if (data.totalResults) {
                if (!estates.length) {
                    estates = data.results;
                }
                renderEstates(data.results);
                return;
            }
            renderEstates();
        } catch (error) {
            console.log(error);
        }
    };

    const moveToTop = async (id) => {
        try {
            const { data } = await request.patch(`estates/${id}`, {
                priority: Date.now(),
            });
            const estateId = data.id;
            estates = estates
                .map((estate) => {
                    if (estate.id === estateId) {
                        // eslint-disable-next-line no-param-reassign
                        estate.priority = data.priority;
                    }
                    return estate;
                })
                .sort((a, b) => b.priority - a.priority);
            renderEstates();
        } catch (error) {
            console.log(error);
        }
    };

    searchInput.oninput = async () => {
        const customId = searchInput.value;
        if (!customId) {
            renderEstates();
            return;
        }
        await getEstates({ customId });
    };

    await getEstates();

    const confirmDeleteModal = new EncacapModal("#confirmDeleteModal");
    const confirmDeleteForm = new EncacapForm("#confirmDeleteForm");
    const confirmDeleteButton = confirmDeleteForm.querySelector("button[type=submit]");
    const deletedTitle = document.querySelector("#deletedTitle");

    estatesContainer.onclick = async (event) => {
        const moveToTopButton = event.target.closest(".move-to-top");
        const moveToTrash = event.target.closest(".move-to-trash");
        if (moveToTopButton) {
            moveToTopButton.querySelector(".spinner").classList.remove("hidden");
            moveToTop(moveToTopButton.dataset.id);
            return;
        }
        if (moveToTrash) {
            const deletedEstateId = moveToTrash.dataset.id;

            confirmDeleteModal.show();
            confirmDeleteForm.hideNotify();
            confirmDeleteButton.dataset.id = deletedEstateId;
            confirmDeleteButton.enable();
            confirmDeleteButton.loading.hide();

            const deletedEstate = estates.find((estate) => estate.id === deletedEstateId);

            deletedTitle.innerHTML = `
                <strong>#${deletedEstate.customId}</strong>
                ${deletedEstate.title}
            `;
        }
    };

    confirmDeleteButton.onclick = async (event) => {
        const { id: estateId } = confirmDeleteButton.dataset;
        event.preventDefault();
        confirmDeleteForm.disable();
        confirmDeleteButton.loading.show();

        try {
            await request.delete(`estates/${estateId}`);
            confirmDeleteModal.hide();
            estates = estates.filter((estate) => estate.id !== estateId);
            renderEstates();
        } catch (error) {
            confirmDeleteForm.showError("Đã xảy ra lỗi khi xoá bài viết.", error);
            confirmDeleteForm.enable();
            confirmDeleteButton.loading.hide();
        }
    };
});
