const prepare = require("../utils/prepare");
const EncacapForm = require("../utils/form");
const EncacapModal = require("../utils/modal");

const NewsItem = require("../components/NewsItem");
const DraftItem = require("../components/NewsDraftItem");

prepare(async (request) => {
    const newsContainer = document.querySelector("#news_container");
    const draftsContainer = document.querySelector("#draft_container");
    const searchInput = document.querySelector("#search");

    let news = [];
    let drafts = [];

    const renderNews = (data = news) => {
        newsContainer.innerHTML = "";
        data.forEach((newsData) => {
            const estateItem = NewsItem(newsData);
            newsContainer.appendChild(estateItem);
        });
    };

    const getNews = async (params) => {
        try {
            const { data } = await request.get("news", {
                params: { limit: 100000, sortBy: "priority:desc", isPublished: true, ...params },
            });
            if (data.totalResults) {
                if (!news.length) {
                    news = data.results;
                }
                renderNews(data.results);
                return;
            }
            renderNews();
        } catch (error) {
            console.log(error);
        }
    };

    const renderDrafts = (data = drafts) => {
        draftsContainer.innerHTML = "";
        if (data.length === 0) {
            draftsContainer.innerHTML = `<div class="p-4 bg-white rounded-md">Hiện không có bản nháp nào</div>`;
            return;
        }
        data.forEach((newsData) => {
            const draftItem = DraftItem(newsData);
            draftsContainer.appendChild(draftItem);
        });
    };

    const getDrafts = async (params) => {
        try {
            const { data } = await request.get("news", {
                params: { limit: 100000, sortBy: "priority:desc", isPublished: false, ...params },
            });
            if (data.totalResults) {
                if (!drafts.length) {
                    drafts = data.results;
                }
                renderDrafts(data.results);
                return;
            }
            renderDrafts();
        } catch (error) {
            console.log(error);
        }
    };

    await getNews();
    await getDrafts();

    // Xử lý tìm kiếm
    searchInput.oninput = async () => {
        const searchValue = searchInput.value;
        if (!searchValue) {
            renderNews();
            return;
        }
        await getNews({
            title: searchValue,
        });
    };

    // Xử lý khi nhấn nút 'Xoá'
    const confirmDeleteModal = new EncacapModal("#confirmDeleteModal");
    const confirmDeleteForm = new EncacapForm("#confirmDeleteForm");
    const confirmDeleteButton = confirmDeleteForm.querySelector("button[type=submit]");
    const deletedTitle = document.querySelector("#deletedTitle");

    const handleDeleteButtonClicked = (event) => {
        const moveToTrashButton = event.target.closest(".move-to-trash");
        if (moveToTrashButton) {
            const deletedItemId = moveToTrashButton.dataset.id;
            const deletedItemType = moveToTrashButton.dataset.type;

            if (deletedItemType === "news") {
                const deletedNews = news.find((newsItem) => newsItem.id === deletedItemId);

                deletedTitle.innerHTML = `
                    <strong>#${deletedNews.id}</strong>
                    ${deletedNews.title}
                `;
            } else {
                const deletedDraft = drafts.find((draftItem) => draftItem.id === deletedItemId);

                deletedTitle.innerHTML = `
                    <strong>#${deletedDraft.id}</strong>
                    ${deletedDraft.title}
                `;
            }

            confirmDeleteModal.show();
            confirmDeleteForm.hideNotify();
            confirmDeleteButton.dataset.id = deletedItemId;
            confirmDeleteButton.enable();
            confirmDeleteButton.loading.hide();
        }
    };

    newsContainer.onclick = (event) => handleDeleteButtonClicked(event);
    draftsContainer.onclick = (event) => handleDeleteButtonClicked(event);

    confirmDeleteButton.onclick = async (event) => {
        const { id: newsId, type: newsType } = confirmDeleteButton.dataset;

        event.preventDefault();
        confirmDeleteForm.disable();
        confirmDeleteButton.loading.show();

        try {
            await request.delete(`news/${newsId}`);
            confirmDeleteModal.hide();
            if (newsType === "news") {
                news = news.filter((newsItem) => newsItem.id !== newsId);
                renderNews();
            } else {
                drafts = drafts.filter((draftItem) => draftItem.id !== newsId);
                renderDrafts();
            }
        } catch (error) {
            confirmDeleteForm.showError("Đã xảy ra lỗi khi xoá bài viết.", error);
            confirmDeleteForm.enable();
            confirmDeleteButton.loading.hide();
        }
    };
});
