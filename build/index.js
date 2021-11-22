const fsPromise = require("fs/promises");
// eslint-disable-next-line import/no-extraneous-dependencies
const fsExtra = require("fs-extra");
const configs = require("../encacap.config");

(async () => {
    const BUILD_FOLDER = "./dist/";

    const copy = async (src, dest) => {
        await fsExtra.copy(src, dest);
    };

    await fsExtra.remove(BUILD_FOLDER);

    try {
        const files = await fsPromise.readdir("./");
        const defaultExcludeFiles = ["package.json", "package-lock.json"];
        const defaultExcludeFolders = ["node_modules", "build"];
        const excludeFiles = [...defaultExcludeFiles, ...configs.excludeFiles];
        const excludeFolders = [...defaultExcludeFolders, ...(configs.excludeFolders || [])];
        const includeFiles = configs.includeFiles || [];
        files.forEach(async (file) => {
            const path = `./${file}`;
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            const stats = await fsPromise.stat(path);

            try {
                if (stats.isDirectory() && !excludeFolders.includes(file) && file[0] !== ".") {
                    await copy(path, `${BUILD_FOLDER}${file}`);
                } else if (
                    (stats.isFile() &&
                        !excludeFiles.includes(file) &&
                        file[0] !== "." &&
                        !file.includes(".config.js")) ||
                    includeFiles.includes(file)
                ) {
                    await copy(path, `${BUILD_FOLDER}${file}`);
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(`Build error: ${error}`);
            }
        });
        // eslint-disable-next-line no-console
        console.log("Build completed ^_^!");
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
    }
})();
