import { useState } from 'react'
import JSZip from 'jszip'
import FileSaver from 'file-saver'
import { RepoFile, RepoInfo } from '../types'
import { fetchFolderData, processFolderContents } from '../utils/apiUtils'
import { generateZip } from '../utils/zipUtils'

export const useGitHubFolderTree = (folderUrl: string, apiKey?: string) => {
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([])
  const [repoInfo, setRepoInfo] = useState<RepoInfo>({
    user: '',
    repo: '',
    branch: '',
    dir: '',
  })
  const { repo, branch, dir } = repoInfo
  const [error, setError] = useState<string>('')
  const [log, setLog] = useState<string>('')

  const fetchRepositoryContents = async () => {
    try {
      const urlRegex = /https:\/\/github.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/?(.*)/
      if (!folderUrl) {
        setError('Please enter a GitHub folder URL')
        return
      }

      const matches = folderUrl.match(urlRegex)

      if (!matches) {
        setError('Invalid GitHub folder URL')
        return
      }

      const user = matches[1]
      const repo = matches[2]
      const branch = matches[3]
      const dir = matches[4] || ''

      setRepoInfo({ user, repo, branch, dir })

      setLog(`Extracted user: ${user}, repo: ${repo}, branch: ${branch}, dir: ${dir}`)

      const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${dir}?ref=${branch}`
      setLog(`Fetching repository contents from ${apiUrl}`)
      const folderData = await fetchFolderData(apiUrl, setError, setLog, apiKey)
      setLog('Folder data fetched')

      const processedFiles = await processFolderContents(folderData, setError, setLog, dir, apiKey)
      setRepoFiles(prevFiles => [...prevFiles, ...processedFiles].filter(Boolean) as RepoFile[])
    } catch (error: any) {
      setError(error.response?.data?.message)
    }
  }

  const useGitHubFolderDownload = async () => {
    if (repoFiles.length === 0) {
      setError('No repository files available')
      return
    }

    try {
      const zip = new JSZip()
      await generateZip(zip, repoFiles, setError, setLog)
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const fileName = dir ? dir.split('/').pop() : `${repo}-${branch}`
      console.log(fileName)
      FileSaver.saveAs(zipBlob, fileName)
    } catch (error: any) {
      setError('An error occurred while creating the ZIP file')
    }
  }

  return {
    repoFiles,
    fetchRepositoryContents,
    useGitHubFolderDownload,
    error,
    log,
    repoInfo,
  }
}
