import { useState } from 'react'
import axios from 'axios'

interface RepoFile {
  url: string
  name: string
  file_type: string
  download_url: string
  sha: string
  size: string
  path: string
  type?: string
}

export const useGitHubFolderTree = (folderUrl: string, apiKey?: string) => {
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([])
  const [error, setError] = useState<string>('')
  const [log, setLog] = useState<string>('')

  const fetchFolderData = async (folderUrl: string): Promise<any> => {
    const contentIndex = folderUrl.indexOf('contents/') + 'contents/'.length
    const decodedUrl = decodeURIComponent(
      contentIndex > 0 ? folderUrl.substring(contentIndex) : folderUrl
    )
    setLog(`Fetching data from ${decodedUrl}`)
    const options: any = {}
    if (apiKey) {
      options.headers = {
        Authorization: `Bearer ${apiKey}`,
      }
    }
    const { data: response } = await axios.get(folderUrl, options)
    setLog(`Data fetched from ${decodedUrl}`)
    return response
  }

  const processFolderContents = async (folder: RepoFile[]): Promise<(RepoFile | null)[]> => {
    const filePromises = folder.map(async (item: RepoFile) => {
      if (item.type === 'file') {
        setLog(`Processing ${item.name}`)
        const extension = item.name.split('.').pop() || 'unknown'
        const sizeInKB = Math.round(parseInt(item.size) / 1024)
        let size
        if (sizeInKB >= 1024) {
          const sizeInMB = (sizeInKB / 1024).toFixed(2)
          size = sizeInMB + ' MB'
        } else {
          size = sizeInKB + ' KB'
        }

        return {
          name: item.name,
          file_type: extension,
          download_url: item.download_url,
          sha: item.sha,
          size: size,
          path: item.path,
        }
      } else if (item.type === 'dir') {
        setLog(`Processing ${item.name}`)
        const subFolder = await fetchFolderData(item.url)
        setLog(`Subfolder data fetched from ${item.url}`)
        const subFolderFiles = await processFolderContents(subFolder)
        setLog(`Processed ${item.name}`)
        return subFolderFiles
      }

      return null
    })

    const files = await Promise.all(filePromises)
    const flattenedFiles = files.flat()

    setLog('Processing complete')
    return flattenedFiles.filter(Boolean) as (RepoFile | null)[]
  }

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
      const dir = matches[4]
      console.log(user, repo, branch, dir)
      setLog(`Extracted user: ${user}, repo: ${repo}, branch: ${branch}, dir: ${dir}`)

      const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${dir}?ref=${branch}`
      setLog(`Fetching repository contents from ${apiUrl}`)
      const folderData = await fetchFolderData(apiUrl)
      setLog('Folder data fetched')

      const processedFiles = await processFolderContents(folderData)
      setRepoFiles(prevFiles => [...prevFiles, ...processedFiles].filter(Boolean) as RepoFile[])
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred')
      console.error(`Error: ${error}`)
    }
  }

  return {
    repoFiles,
    error,
    log,
    fetchRepositoryContents,
  }
}
