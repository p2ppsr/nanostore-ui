import React, { type FormEvent, useState, useEffect } from 'react'
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
  DialogActions
} from '@mui/material'
import { CloudDownload } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { download } from 'nanoseek'
import constants from '../utils/constants'
import { type SelectChangeEvent } from '@mui/material'

const DownloadForm: React.FC = () => {
  const [confederacyURL, setConfederacyURL] = useState<string>('')
  const [confederacyURLs, setConfederacyURLs] = useState<string[]>(constants.confederacyURLs.map(x => x.toString()))
  const [downloadURL, setDownloadURL] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [inputsValid, setInputsValid] = useState<boolean>(false)
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [newOption, setNewOption] = useState<string>('')

  useEffect(() => {
    setInputsValid(confederacyURL.trim() !== '' && downloadURL.trim() !== '')
  }, [confederacyURL, downloadURL])

  useEffect(() => {
    if (Array.isArray(constants.confederacyURLs) && constants.confederacyURLs.length > 0) {
      setConfederacyURL(constants.confederacyURLs[0].toString())
    }
  }, [])

  const handleDownload = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    try {
      if (downloadURL.trim() !== '') {
        const { mimeType, data } = await download({
          UHRPUrl: downloadURL.trim(),
          confederacyHost: confederacyURL.trim()
        })
        const blob = new Blob([data], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = downloadURL.trim() !== '' ? downloadURL.trim() : 'download'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      toast.error('An error occurred during download')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (event: SelectChangeEvent<string>): void => {
    const selectedValue = event.target.value
    if (selectedValue === 'add-new-option') {
      setOpenDialog(true)
    } else {
      setConfederacyURL(selectedValue)
    }
  }

  const handleCloseDialog = (): void => {
    setOpenDialog(false)
  }

  const handleAddOption = (): void => {
    if (newOption.trim() !== '' && !constants.confederacyURLs.includes(newOption)) {
      setConfederacyURLs(prevConfederacyURLs => [...prevConfederacyURLs, newOption])
      setConfederacyURL(newOption)
      setNewOption('')
      setOpenDialog(false)
    }
  }

  return (
    <form onSubmit={handleDownload}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant='h4'>Download Form</Typography>
          <Typography color='textSecondary' paragraph>
            Download files from NanoStore
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>Confederacy Resolver URL</InputLabel>
            <Select
              value={confederacyURL}
              onChange={handleSelectChange}
              label='Confederacy Resolver URL'
            >
              {confederacyURLs.map((url, index) => (
                <MenuItem key={index} value={url.toString()}>
                  {url.toString()}
                </MenuItem>
              ))}
              <MenuItem value='add-new-option'>+ Add New Option</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant='outlined'
            label='UHRP URL'
            value={downloadURL}
            onChange={(e) => { setDownloadURL(e.target.value) }}
          />
          <Grid />

          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Add a New Confederacy Resolver URL</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin='dense'
                label='URL'
                type='text'
                fullWidth
                value={newOption}
                onChange={(e) => { setNewOption(e.target.value) }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleAddOption}>Add</Button>
            </DialogActions>
          </Dialog>
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
