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
exports.useGitHubFolderTree = void 0;
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
const useGitHubFolderTree = (folderUrl, apiKey) => {
    const [repoFiles, setRepoFiles] = (0, react_1.useState)([]);
    const [error, setError] = (0, react_1.useState)('');
    const [log, setLog] = (0, react_1.useState)('');
    const fetchFolderData = (folderUrl) => __awaiter(void 0, void 0, void 0, function* () {
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
    const processFolderContents = (folder) => __awaiter(void 0, void 0, void 0, function* () {
        const filePromises = folder.map((item) => __awaiter(void 0, void 0, void 0, function* () {
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
                const subFolder = yield fetchFolderData(item.url);
                setLog(`Subfolder data fetched from ${item.url}`);
                const subFolderFiles = yield processFolderContents(subFolder);
                setLog(`Processed ${item.name}`);
                return subFolderFiles;
            }
            return null;
        }));
        const files = yield Promise.all(filePromises);
        const flattenedFiles = files.flat();
        setLog('Processing complete');
        return flattenedFiles.filter(Boolean);
    });
    const fetchRepositoryContents = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const urlRegex = /https:\/\/github.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/?(.*)/;
            if (!folderUrl) {
                setError('Please enter a GitHub folder URL');
                return;
            }
            const matches = folderUrl.match(urlRegex);
            if (!matches) {
                setError('Invalid GitHub folder URL');
                return;
            }
            const user = matches[1];
            const repo = matches[2];
            const branch = matches[3];
            const dir = matches[4];
            setLog(`Extracted user: ${user}, repo: ${repo}, branch: ${branch}, dir: ${dir}`);
            const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${dir}?ref=${branch}`;
            setLog(`Fetching repository contents from ${apiUrl}`);
            const folderData = yield fetchFolderData(apiUrl);
            setLog('Folder data fetched');
            const processedFiles = yield processFolderContents(folderData);
            setRepoFiles(prevFiles => [...prevFiles, ...processedFiles].filter(Boolean));
        }
        catch (error) {
            setError(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'An error occurred');
        }
    });
    return {
        repoFiles,
        error,
        log,
        fetchRepositoryContents,
    };
};
exports.useGitHubFolderTree = useGitHubFolderTree;
//# sourceMappingURL=useGitHubFolderTree.js.map