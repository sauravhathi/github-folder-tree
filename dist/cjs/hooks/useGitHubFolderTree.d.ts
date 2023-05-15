interface RepoFile {
    url: string;
    name: string;
    file_type: string;
    download_url: string;
    sha: string;
    size: string;
    path: string;
    type?: string;
}
export declare const useGitHubFolderTree: (folderUrl: string, apiKey?: string) => {
    repoFiles: RepoFile[];
    error: string;
    log: string;
    fetchRepositoryContents: () => Promise<void>;
};
export {};
