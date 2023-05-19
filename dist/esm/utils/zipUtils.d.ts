import JSZip from 'jszip';
import { RepoFile } from '../types';
export declare const generateZip: (zip: JSZip, repoFiles: RepoFile[], setError: (error: string) => void, setLog: (log: string) => void) => Promise<void>;
