import React, { FormEvent, useState, useEffect } from 'react'
import {
  Button,
  LinearProgress,
  Grid,
  TextField,
  Typography
} from '@mui/material'
import { CloudDownload } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { StorageDownloader } from '@bsv/sdk'

interface DownloadFormProps {}

const DownloadForm: React.FC<DownloadFormProps> = () => {
  const [downloadURL, setDownloadURL] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [inputsValid, setInputsValid] = useState<boolean>(false)

  // Simple form validation: must have a non-empty download URL
  useEffect(() => {
    setInputsValid(downloadURL.trim() !== '')
  }, [downloadURL])

  const handleDownload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create the StorageDownloader (no confederacy references)
      const storageDownloader = new StorageDownloader({ networkPreset: 'mainnet' })

      // Attempt to download the file
      const { mimeType, data } = await storageDownloader.download(downloadURL.trim())

      if (!data || !mimeType) {
        throw new Error(`Error fetching file from ${downloadURL}`)
      }

      // Convert number[] to a Uint8Array, then make a Blob
      const dataArray = new Uint8Array(data)
      const blob = new Blob([dataArray], { type: mimeType })
      const url = URL.createObjectURL(blob)

      // Programmatically trigger file download
      const link = document.createElement('a')
      link.href = url
      link.download = downloadURL.trim() || 'download'
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      toast.error('An error occurred during download')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleDownload}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant='h4'>Download Form</Typography>
          <Typography color='textSecondary' paragraph>
            Download files from UHRP Storage
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            variant='outlined'
            label='UHRP URL'
            value={downloadURL}
            onChange={(e) => setDownloadURL(e.target.value)}
          />
        </Grid>

        <Grid item>
          <Button
            variant='contained'
            color='primary'
            size='large'
            type='submit'
            disabled={loading || !inputsValid}
            startIcon={<CloudDownload />}
          >
            Download
          </Button>
        </Grid>

        {loading && (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        )}
      </Grid>
    </form>
  )
}

export default DownloadForm
