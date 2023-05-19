import { RepoFile } from '../types';
export declare const fetchFolderData: (folderUrl: string, setError: (error: string) => void, setLog: (log: string) => void, apiKey?: string) => Promise<any | null>;
export declare const processFolderContents: (folder: any[], setError: (error: string) => void, setLog: (log: string) => void, path?: string, apiKey?: string) => Promise<RepoFile[]>;
