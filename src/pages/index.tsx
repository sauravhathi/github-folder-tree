import React, { FC, useState } from 'react';
import { useGitHubFolderTree } from 'github-folder-tree'

console.log('👨‍💻 Author: Saurav Hathi \n🌟 GitHub: https://github.com/sauravhathi');

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

const ButtonContainer: FC<ButtonContainerProps> = ({
  onFetchRepositoryContents,
  onUseGitHubFolderDownload,
}) => {
  return (
    <div className="button-container">
      <button onClick={onFetchRepositoryContents} className="github-url-button">
        Fetch
      </button>
      <button onClick={onUseGitHubFolderDownload} className="github-url-button">
        Download as ZIP
      </button>
    </div>
  );
};

interface FileItemProps {
  file: RepoFile;
}

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
          <a href={download_url} download={name} target="_blank">
            <button>Download</button>
          </a>
        </div>
      </div>
    </>
  );
};

const GitHubFolderTree: FC = () => {
  const [folderUrl, setFolderUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const {
    repoFiles,
    fetchRepositoryContents,
    useGitHubFolderDownload,
    error,
    log,
    repoInfo
  } = useGitHubFolderTree(folderUrl, apiKey);

  if (repoFiles.length > 0) {
    console.log(repoFiles);
    console.log(repoInfo);
  }

  return (
    <div className="github-folder-data" style={{ marginTop: `${repoFiles.length > 0 ? '20px' : '100px'}`, marginBottom: `${repoFiles.length > 0 ? '20px' : '0'}` }}>
      <input
        type="text"
        value={folderUrl}
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
  );
};

export default GitHubFolderTree;