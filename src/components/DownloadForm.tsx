import React, { FormEvent, useState, useEffect } from 'react'
import {
  Button,
  LinearProgress,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent
} from '@mui/material'
import { CloudDownload } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { isValidURL } from 'uhrp-url'
import { download } from '../../../nanoseek/src/index'
import constants from '../utils/constants'

type DownloadFormProps = Record<string, never>

const DownloadForm: React.FC<DownloadFormProps> = () => {
  const [confederacyURL, setConfederacyURL] = useState<string>('')
  const [confederacyURLs, setConfederacyURLs] = useState<string[]>(
    constants.confederacyURLs.map(x => x.toString())
  )
  const [downloadURL, setDownloadURL] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [inputsValid, setInputsValid] = useState<boolean>(false)
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [newOption, setNewOption] = useState<string>('')

  useEffect(() => {
    setInputsValid(downloadURL.trim() !== '' && isValidURL(downloadURL.trim()))
  }, [downloadURL])

  useEffect(() => {
    if (constants.confederacyURLs && constants.confederacyURLs.length > 0) {
      setConfederacyURL(constants.confederacyURLs[0].toString())
    }
  }, [])

  const handleDownload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { mimeType, data } = await download({
        UHRPUrl: downloadURL.trim() || '',
        confederacyHost: confederacyURL.trim()
      })
      const blob = new Blob([data], { type: mimeType || undefined })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = downloadURL.trim() || 'download'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      toast.error(
        'An error occurred during download. Please check the URL and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value
    if (selectedValue === 'add-new-option') {
      setOpenDialog(true)
    } else {
      setConfederacyURL(selectedValue)
    }
  }

  const handleCloseDialog = () => {
    setNewOption('')
    setOpenDialog(false)
  }

  const handleAddOption = () => {
    if (
      newOption.trim() !== '' &&
      !constants.confederacyURLs.includes(newOption)
    ) {
      setConfederacyURLs(prevConfederacyURLs => [
        ...prevConfederacyURLs,
        newOption
      ])
      setConfederacyURL(newOption)
      setNewOption('')
      setOpenDialog(false)
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
          <FormControl fullWidth variant="outlined">
            <InputLabel>Confederacy Resolver URL</InputLabel>
            <Select
              value={confederacyURL}
              onChange={handleSelectChange}
              label="Confederacy Resolver URL"
            >
              {confederacyURLs.length === 0
                ? (
                <MenuItem disabled>No URLs available</MenuItem>
                  )
                : (
                    confederacyURLs.map((url, index) => (
                  <MenuItem key={index} value={url.toString()}>
                    {url.toString()}
                  </MenuItem>
                    ))
                  )}
              <MenuItem value="add-new-option">+ Add New Option</MenuItem>
            </Select>
          </FormControl>
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
        {!inputsValid && (
          <Grid item xs={12}>
            <Typography color="error">
              Please enter a valid UHRP URL.
            </Typography>
          </Grid>
        )}
        <Grid item>
          <Button
            aria-label="Download file"
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
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Add a New Confederacy Resolver URL</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="URL"
              type="text"
              fullWidth
              value={newOption}
              onChange={e => setNewOption(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleAddOption}>Add</Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </form>
  )
}

export default DownloadForm
