const prepare = require("../utils/prepare");
const EncacapModal = require("../utils/modal");
const EncacapForm = require("../utils/form");

const EstateItem = require("../components/EstateItem");
const EstateDraftItem = require("../components/EstateDraftItem");

prepare(async (request) => {
    const estatesContainer = document.querySelector("#estates_container");
    const draftContainer = document.querySelector("#draft_container");
    const searchInput = document.querySelector("#search");
    let estates = [];
    let drafts = [];

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
                params: { limit: 100000, sortBy: "priority:desc", isPublished: true, ...params },
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

    const renderDrafts = (data = drafts) => {
        draftContainer.innerHTML = "";
        if (data.length === 0) {
            draftContainer.innerHTML = `<div class="mb-4 p-4 bg-white rounded-md">Hiện không có bản nháp nào.</div>`;
            return;
        }
        data.forEach((estate) => {
            const draftItem = EstateDraftItem(estate);
            draftContainer.appendChild(draftItem);
        });
    };

    const getDraft = async (params) => {
        try {
            const { data } = await request.get("estates", {
                params: { limit: 100000, sortBy: "priority:desc", isPublished: false, ...params },
            });
            drafts = data.results;
            renderDrafts(drafts);
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

    getDraft();

    const confirmDeleteModal = new EncacapModal("#confirmDeleteModal");
    const confirmDeleteForm = new EncacapForm("#confirmDeleteForm");
    const confirmDeleteButton = confirmDeleteForm.querySelector("button[type=submit]");
    const deletedTitle = document.querySelector("#deletedTitle");

    const handleDeleteButtonClicked = async (event) => {
        const moveToTopButton = event.target.closest(".move-to-top");
        const moveToTrash = event.target.closest(".move-to-trash");
        if (moveToTopButton) {
            moveToTopButton.querySelector(".spinner").classList.remove("hidden");
            moveToTop(moveToTopButton.dataset.id);
            return;
        }
        if (moveToTrash) {
            const deletedEstateId = moveToTrash.dataset.id;
            const deletedEstateType = moveToTrash.dataset.type;
            let deletedEstate = null;

            confirmDeleteModal.show();
            confirmDeleteForm.hideNotify();
            confirmDeleteButton.dataset.id = deletedEstateId;
            confirmDeleteButton.dataset.type = deletedEstateType;
            confirmDeleteButton.enable();
            confirmDeleteButton.loading.hide();

            if (deletedEstateType === "draft") {
                deletedEstate = drafts.find((draft) => draft.id === deletedEstateId);
            } else {
                deletedEstate = estates.find((estate) => estate.id === deletedEstateId);
            }

            deletedTitle.innerHTML = `
                <strong>#${deletedEstate?.customId}</strong>
                ${deletedEstate?.title || "Bài viết không có tiêu đề"}
            `;
        }
    };

    estatesContainer.onclick = handleDeleteButtonClicked;
    draftContainer.onclick = handleDeleteButtonClicked;

    confirmDeleteButton.onclick = async (event) => {
        const { id: estateId, type: estateType } = confirmDeleteButton.dataset;
        event.preventDefault();
        confirmDeleteForm.disable();
        confirmDeleteButton.loading.show();

        try {
            await request.delete(`estates/${estateId}`);
            confirmDeleteModal.hide();
            if (estateType === "draft") {
                drafts = drafts.filter((draft) => draft.id !== estateId);
                renderDrafts(drafts);
            } else {
                estates = estates.filter((estate) => estate.id !== estateId);
                renderEstates();
            }
        } catch (error) {
            confirmDeleteForm.showError("Đã xảy ra lỗi khi xoá bài viết.", error);
            confirmDeleteForm.enable();
            confirmDeleteButton.loading.hide();
        }
    };
});
