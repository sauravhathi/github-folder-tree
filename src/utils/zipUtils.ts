import JSZip from 'jszip'
import { RepoFile } from '../types'

export const generateZip = async (
  zip: JSZip,
  repoFiles: RepoFile[],
  setError: (error: string) => void,
  setLog: (log: string) => void
) => {
  const totalFiles = repoFiles.length
  let completedFiles = 0

  const filePromises = repoFiles.map(async (file: RepoFile) => {
    const filePath = file.path

    try {
      const response = await fetch(file.download_url)

      if (!response.ok) {
        throw new Error(`Failed to fetch ${file.name}`)
      }

      const contentLength = response.headers.get('content-length')
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0
      let downloadedSize = 0

      const fileContent = await response.blob()

      const downloadProgress = (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
        if (event.lengthComputable) {
          downloadedSize = event.loaded
          const progress = Math.min(Math.round((downloadedSize / totalSize) * 100), 100)
          setLog(`Downloading ${file.name}: ${progress}%`)
        }
      }

      const reader = new FileReader()

      reader.onload = () => {
        if (filePath) {
          const pathSegments = filePath.split('/')
          let folder: JSZip | null = zip.folder(pathSegments[0]) as JSZip
          const nestedFolders = pathSegments.slice(1, -1)
          nestedFolders.forEach(folderName => {
            folder = folder!.folder(folderName)
          })
          folder!.file(file.name, reader.result as ArrayBuffer)
        } else {
          zip.file(file.name, reader.result as ArrayBuffer)
        }
        completedFiles++
      }

      reader.onerror = error => {
        setError(`Error reading file content: ${error}`)
        throw error
      }

      reader.onprogress = downloadProgress as unknown as (event: ProgressEvent<FileReader>) => any

      reader.readAsArrayBuffer(fileContent)

      await new Promise(resolve => {
        reader.onloadend = () => resolve(null)
      })
    } catch (error: any) {
      setError(`Error fetching file content: ${error.message}`)
      throw error
    }
  })

  await Promise.all(filePromises)

  setLog(`Downloaded and added ${completedFiles} out of ${totalFiles} files to the zip.`)
}
