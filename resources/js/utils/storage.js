module.exports = (name) => {
    const item = JSON.parse(window.localStorage.getItem(name));
    return {
        get: () => item,
        set: (value) => {
            window.localStorage.setItem(name, JSON.stringify(value));
        },
        remove: () => {
            window.localStorage.removeItem(name);
        },
    };
};
