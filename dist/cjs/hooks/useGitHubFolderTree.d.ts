import { RepoFile, RepoInfo } from '../types';
export declare const useGitHubFolderTree: (folderUrl: string, apiKey?: string) => {
    repoFiles: RepoFile[];
    fetchRepositoryContents: () => Promise<void>;
    useGitHubFolderDownload: () => Promise<void>;
    error: string;
    log: string;
    repoInfo: RepoInfo;
};
