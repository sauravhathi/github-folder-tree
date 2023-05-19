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
const jszip_1 = __importDefault(require("jszip"));
const file_saver_1 = __importDefault(require("file-saver"));
const apiUtils_1 = require("../utils/apiUtils");
const zipUtils_1 = require("../utils/zipUtils");
const useGitHubFolderTree = (folderUrl, apiKey) => {
    const [repoFiles, setRepoFiles] = (0, react_1.useState)([]);
    const [repoInfo, setRepoInfo] = (0, react_1.useState)({
        user: '',
        repo: '',
        branch: '',
        dir: '',
    });
    const { repo, branch, dir } = repoInfo;
    const [error, setError] = (0, react_1.useState)('');
    const [log, setLog] = (0, react_1.useState)('');
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
            const dir = matches[4] || '';
            setRepoInfo({ user, repo, branch, dir });
            setLog(`Extracted user: ${user}, repo: ${repo}, branch: ${branch}, dir: ${dir}`);
            const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${dir}?ref=${branch}`;
            setLog(`Fetching repository contents from ${apiUrl}`);
            const folderData = yield (0, apiUtils_1.fetchFolderData)(apiUrl, setError, setLog, apiKey);
            setLog('Folder data fetched');
            const processedFiles = yield (0, apiUtils_1.processFolderContents)(folderData, setError, setLog, dir, apiKey);
            setRepoFiles(prevFiles => [...prevFiles, ...processedFiles].filter(Boolean));
        }
        catch (error) {
            setError((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message);
        }
    });
    const useGitHubFolderDownload = () => __awaiter(void 0, void 0, void 0, function* () {
        if (repoFiles.length === 0) {
            setError('No repository files available');
            return;
        }
        try {
            const zip = new jszip_1.default();
            yield (0, zipUtils_1.generateZip)(zip, repoFiles, setError, setLog);
            const zipBlob = yield zip.generateAsync({ type: 'blob' });
            const fileName = dir ? dir.split('/').pop() : `${repo}-${branch}`;
            console.log(fileName);
            file_saver_1.default.saveAs(zipBlob, fileName);
        }
        catch (error) {
            setError('An error occurred while creating the ZIP file');
        }
    });
    return {
        repoFiles,
        fetchRepositoryContents,
        useGitHubFolderDownload,
        error,
        log,
        repoInfo,
    };
};
exports.useGitHubFolderTree = useGitHubFolderTree;
//# sourceMappingURL=useGitHubFolderTree.js.map