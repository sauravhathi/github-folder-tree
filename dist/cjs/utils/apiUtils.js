"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFolderContents = exports.fetchFolderData = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchFolderData = (folderUrl, setError, setLog, apiKey) => __awaiter(void 0, void 0, void 0, function* () {
    const contentIndex = folderUrl.indexOf('contents/') + 'contents/'.length;
    const decodedUrl = decodeURIComponent(contentIndex > 0 ? folderUrl.substring(contentIndex) : folderUrl);
    setLog(`Fetching data from ${decodedUrl}`);
    const options = {};
    if (apiKey) {
        options.headers = {
            Authorization: `Bearer ${apiKey}`,
        };
    }
    const { data: response } = yield axios_1.default.get(folderUrl, options);
    setLog(`Data fetched from ${decodedUrl}`);
    return response;
});
exports.fetchFolderData = fetchFolderData;
const processFolderContents = (folder, setError, setLog, path, apiKey) => __awaiter(void 0, void 0, void 0, function* () {
    const filePromises = folder.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (item.type === 'file') {
                setLog(`Processing ${item.name}`);
                const extension = item.name.split('.').pop() || 'unknown';
                const sizeInKB = Math.round(parseInt(item.size) / 1024);
                let size;
                if (sizeInKB >= 1024) {
                    const sizeInMB = (sizeInKB / 1024).toFixed(2);
                    size = sizeInMB + ' MB';
                }
                else {
                    size = sizeInKB + ' KB';
                }
                return {
                    name: item.name,
                    file_type: extension,
                    download_url: item.download_url,
                    sha: item.sha,
                    size: size,
                    path: item.path,
                };
            }
            else if (item.type === 'dir') {
                setLog(`Processing ${item.name}`);
                const subFolder = yield (0, exports.fetchFolderData)(item.url, setError, setLog, apiKey);
                if (subFolder !== null) {
                    setLog(`Processing ${item.name}`);
                    const subFolderFiles = yield (0, exports.processFolderContents)(subFolder, setError, setLog, item.path, apiKey);
                    setLog(`Processed ${item.name}`);
                    return subFolderFiles;
                }
                else {
                    setLog(`Skipping ${item.name} due to error in fetching subfolder data`);
                    return null;
                }
            }
        }
        catch (error) {
            setError(`Error processing ${item.name}: ${error.message}`);
            return null;
        }
    }));
    const files = yield Promise.all(filePromises);
    const flattenedFiles = files.flat();
    setLog('Processing complete');
    return flattenedFiles.filter((file) => file !== null);
});
exports.processFolderContents = processFolderContents;
//# sourceMappingURL=apiUtils.js.map