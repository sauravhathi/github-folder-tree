import React, { FC, useState, useEffect, useRef } from 'react';
import { useGitHubFolderTree } from 'github-folder-tree'
import { FaCodeBranch } from 'react-icons/fa'
import Head from 'next/head'

console.log('👨‍💻 Author: Saurav Hathi \n🌟 GitHub: https://github.com/sauravhathi');

// start interface definitions
interface RepoFile {
  name: string;
  file_type: string;
  download_url: string;
  sha: string;
  size: string;
  path: string;
}

interface ButtonContainerProps {
  onFetchRepositoryContents: () => void;
  onUseGitHubFolderDownload: () => void;
}

interface FileItemProps {
  file: RepoFile;
}
// end interface definitions

// ButtonContainer component contains buttons to fetch repo contents and download repo as ZIP
const ButtonContainer: FC<ButtonContainerProps> = ({
  onFetchRepositoryContents,
  onUseGitHubFolderDownload,
}) => {
  return (
    <div className="button-container">
      <button onClick={onFetchRepositoryContents} className="github-url-button" aria-label="Fetch">
        Fetch
      </button>
      <button onClick={onUseGitHubFolderDownload} className="github-url-button" aria-label="Download as ZIP">
        Download as ZIP
      </button>
    </div>
  );
};

// FileItem component displays information about a repo
const FileItem: FC<FileItemProps> = ({ file }) => {
  const { name, file_type, size, download_url, sha } = file;

  return (
    <>
      <div className="file-item">
        <div className="file-item__name">{name}</div>
        <div className="file-item__type">{file_type}</div>
        <div className="file-item__size">{size}</div>
        <div className="file-item__sha">{sha}</div>
        <div className="file-item__download">
          <a href={download_url} download={name} target="_blank" title="Download">
            <button aria-label="Download">
              Download
            </button>
          </a>
        </div>
      </div>
    </>
  );
};

const GitHubFolderTree: FC = () => {
  const ref = useRef<HTMLInputElement>(null); // ref for button to focus on load and on refresh click (for accessibility)
  const [folderUrl, setFolderUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  // useGitHubFolderTree hook returns repoFiles, fetchRepositoryContents, useGitHubFolderDownload, error, log, repoInfo
  const {
    repoFiles,
    fetchRepositoryContents,
    useGitHubFolderDownload,
    error,
    log,
    repoInfo
  } = useGitHubFolderTree(folderUrl, apiKey);

  // Log repoFiles and repoInfo on load
  if (repoFiles.length > 0) {
    console.log(repoFiles);
    console.log(repoInfo);
  }

  // Focus on button on load for accessibility
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return (
    <>
      <Head>
        <title>GitHub Folder Tree</title>
        <meta name="description" content="github-folder-tree is that allows you to fetch and process the contents of a GitHub folder. It retrieves information about the files and subfolders in the specified folder, including their names, file types, download URLs, SHA hashes, sizes, and paths. In addition, it provides the functionality to folder as a ZIP file." />
        <meta name="keywords" content="github folder, github repos, subfolder download, download github folder, download github repo, github folder tree, repos tree, github folder tree download as zip, github api" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inconsolata&display=swap" />
      </Head>
      <div className="github-folder-data" style={{ marginTop: `${repoFiles.length > 0 ? '20px' : '100px'}`, marginBottom: `${repoFiles.length > 0 ? '20px' : '0'}` }}>
        <div className="title-container">
          <h1 className="title">
            <FaCodeBranch className="contributions-icon" />
            <a href="https://github.com/sauravhathi/github-folder-tree/tree/demo" target="_blank" rel="noopener noreferrer" className="title-link">GitHub Folder Tree</a>
          </h1>
        </div>
        <input
          type="text"
          value={folderUrl}
          name="folderUrl"
          ref={ref}
          onChange={(e) => setFolderUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchRepositoryContents();
            }
          }}
          className="github-url-input"
          placeholder="Enter GitHub folder URL"
        />
        {
          error.includes('API rate limit exceeded') || error.includes('Bad credentials') ?
            <input
              type="text"
              value={apiKey}
              name="apiKey"
              onChange={(e) => setApiKey(e.target.value)}
              className="github-url-input"
              style={{ marginTop: '10px' }}
              placeholder="Increase GitHub API rate limit by entering GitHub API key"
            /> : null
        }
        <ButtonContainer
          onFetchRepositoryContents={fetchRepositoryContents}
          onUseGitHubFolderDownload={useGitHubFolderDownload}
        />
        {(error && repoFiles.length === 0) && <div className="error">{error}</div>}
        {log && <div className="log">{log}</div>}
        {repoFiles.length === 0 ? null : (
          <>
            {repoFiles.length === 0 && <div className="loading">Loading...</div>}
            {repoFiles.length > 0 && (
              <div className="file-list">
                {repoFiles.map((file: RepoFile) => (
                  <FileItem key={file.download_url} file={file} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default GitHubFolderTree;