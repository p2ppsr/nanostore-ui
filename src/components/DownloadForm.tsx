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
import { download } from 'nanoseek'
import constants from '../utils/constants'

interface DownloadFormProps {}

const DownloadForm: React.FC<DownloadFormProps> = () => {
  const [confederacyURL, setConfederacyURL] = useState(
    constants.confederacyURL.toString()
  )
  const [downloadURL, setDownloadURL] = useState('')
  const [loading, setLoading] = useState(false)
  const [inputsValid, setInputsValid] = useState(false)

  useEffect(() => {
    setInputsValid(confederacyURL.trim() !== '' && downloadURL.trim() !== '')
  }, [confederacyURL, downloadURL])

  const handleDownload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { mimeType, data } = await download({
        UHRPUrl: downloadURL.trim() || '',
        confederacyURL: confederacyURL.trim()
      })
      const blob = new Blob([data], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = downloadURL.trim() || 'download'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      toast.error('An error occurred during download')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleDownload}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Download Form</Typography>
          <Typography color="textSecondary" paragraph>
            Download files from NanoStore
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="Confederacy Resolver URL"
            value={confederacyURL}
            onChange={e => setConfederacyURL(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="UHRP URL"
            value={downloadURL}
            onChange={e => setDownloadURL(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            disabled={loading || !inputsValid}
            startIcon={<CloudDownload />}
          >
            Download
          </Button>
          {loading && (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          )}
        </Grid>
      </Grid>
    </form>
  )
}

export default DownloadForm
