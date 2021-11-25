const prepare = require("../utils/prepare");
const storage = require("../utils/storage");

prepare((request, loading) => {
    const clickMeButton = document.querySelector("button");
    clickMeButton.onclick = async () => {
        const user = storage("user").get();
        try {
            const { data, config } = await request.get(`/users/${user.id}`);
            console.log(data, config);
        } catch (error) {
            console.log(error);
        }
    };
});
