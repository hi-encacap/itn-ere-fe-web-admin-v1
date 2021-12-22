const { nanoid } = require("nanoid");

class EncacapFiles {
    constructor() {
        this.files = [];
    }

    push(file) {
        if (file && !this.find(file)) {
            const { publicId } = file;
            if (!publicId) {
                // eslint-disable-next-line no-param-reassign
                file.id = nanoid();
            } else {
                // eslint-disable-next-line no-param-reassign
                file.id = publicId;
            }
            this.files.push(file);
            return true;
        }
        return false;
    }

    find(file) {
        if (typeof file === "string") {
            return this.files.find((f) => f.name === file);
        }
        if (file.publicId) {
            return this.files.find((f) => f.publicId === file.publicId);
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

    getTrueFile() {
        return this.files.filter((file) => file.size);
    }

    get length() {
        return this.files.length;
    }
}

module.exports = EncacapFiles;
