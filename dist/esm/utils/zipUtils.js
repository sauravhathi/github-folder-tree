var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const generateZip = (zip, repoFiles, setError, setLog) => __awaiter(void 0, void 0, void 0, function* () {
    const totalFiles = repoFiles.length;
    let completedFiles = 0;
    const filePromises = repoFiles.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        const filePath = file.path;
        try {
            const response = yield fetch(file.download_url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${file.name}`);
            }
            const contentLength = response.headers.get('content-length');
            const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
            let downloadedSize = 0;
            const fileContent = yield response.blob();
            const downloadProgress = (event) => {
                if (event.lengthComputable) {
                    downloadedSize = event.loaded;
                    const progress = Math.min(Math.round((downloadedSize / totalSize) * 100), 100);
                    setLog(`Downloading ${file.name}: ${progress}%`);
                }
            };
            const reader = new FileReader();
            reader.onload = () => {
                if (filePath) {
                    const pathSegments = filePath.split('/');
                    let folder = zip.folder(pathSegments[0]);
                    const nestedFolders = pathSegments.slice(1, -1);
                    nestedFolders.forEach(folderName => {
                        folder = folder.folder(folderName);
                    });
                    folder.file(file.name, reader.result);
                }
                else {
                    zip.file(file.name, reader.result);
                }
                completedFiles++;
            };
            reader.onerror = error => {
                setError(`Error reading file content: ${error}`);
                throw error;
            };
            reader.onprogress = downloadProgress;
            reader.readAsArrayBuffer(fileContent);
            yield new Promise(resolve => {
                reader.onloadend = () => resolve(null);
            });
        }
        catch (error) {
            setError(`Error fetching file content: ${error.message}`);
            throw error;
        }
    }));
    yield Promise.all(filePromises);
    setLog(`Downloaded and added ${completedFiles} out of ${totalFiles} files to the zip.`);
});
//# sourceMappingURL=zipUtils.js.map