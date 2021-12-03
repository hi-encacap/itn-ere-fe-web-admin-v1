const { nanoid } = require("nanoid");

class EncacapFiles {
    constructor() {
        this.files = [];
    }

    push(file) {
        if (file && !this.find(file)) {
            this.files.push(file);
            // eslint-disable-next-line no-param-reassign
            file.id = nanoid();
            return true;
        }
        return false;
    }

    find(file) {
        if (typeof file === "string") {
            return this.files.find((f) => f.name === file);
        }
        return this.files.find((f) => f.name === file.name && f.size === file.size);
    }

    remove(file) {
        if (typeof file === "string") {
            const index = this.files.findIndex((f) => f.id === file);
            if (index !== -1) {
                this.files.splice(index, 1);
            }
        }
    }

    getFiles() {
        return this.files;
    }
}

module.exports = EncacapFiles;
