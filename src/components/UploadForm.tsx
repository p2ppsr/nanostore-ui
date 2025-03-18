import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import {
  Button,
  LinearProgress,
  Grid,
  Select,
  MenuItem,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import { toast } from 'react-toastify'
import constants from '../utils/constants'
import { StorageUploader, WalletClient } from '@bsv/sdk'

interface UploadFormProps {}

const UploadForm: React.FC<UploadFormProps> = () => {
  const [storageURL, setStorageURL] = useState<string>('')
  const [storageURLs, setStorageURLs] = useState<string[]>(constants.storageURLs.map(x => x.toString()))
  const [hostingMinutes, setHostingMinutes] = useState<number>(180) // Default: 3 Hours (180 minutes)
  const [loading, setLoading] = useState<boolean>(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [results, setResults] = useState<{ uhrpURL: string } | null>(null)
  const [actionTXID, setActionTXID] = useState('')
  const [inputsValid, setInputsValid] = useState<boolean>(false)
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [newOption, setNewOption] = useState<string>('')

  useEffect(() => {
    setInputsValid(storageURL.trim() !== '' && storageURL.trim() !== '')
  }, [storageURL])

  useEffect(() => {
    if (constants.storageURLs && constants.storageURLs.length > 0) {
      setStorageURL(constants.storageURLs[0].toString())
    }
  }, [])

  useEffect(() => {
    setIsFormValid(
      storageURL.trim() !== '' && hostingMinutes >= 180 && file !== null
    )
  }, [storageURL, hostingMinutes, file])

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setActionTXID('')
    try {
      const wallet = new WalletClient('auto', 'localhost')
      const storageUploader = new StorageUploader({
        storageURL,
        wallet
      })

      if (!file) {
        throw new Error('No file was uploaded!')
      }

      // Read file into an ArrayBuffer:
      let fileArrayBuffer: ArrayBuffer | null = null
      try {
        fileArrayBuffer = await file.arrayBuffer()
      } catch (err) {
        console.error('ERROR reading the file:', err)
      }

      if (!fileArrayBuffer) {
        throw new Error('Could not read file array buffer.')
      }
      // Turn the array buffer into a normal number array
      const data = Array.from(new Uint8Array(fileArrayBuffer))
      const uploadableFile = { data, size: data.length, type: file.type }

      // Publish the file using the StorageUploader
      const uploadResult = await storageUploader.publishFile({
        file: uploadableFile,
        retentionPeriod: hostingMinutes
      })

      // Handle upload success
      setResults({
        uhrpURL: uploadResult.uhrpURL
      })
    } catch (err) {
      console.error('Upload failed:', err)
      toast.error('Upload failed')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files

    if (selectedFiles && selectedFiles.length > 0) {
      const firstFile = selectedFiles[0]
      if (firstFile instanceof File) {
        setFile(firstFile)
      } else {
        console.error('Invalid file object received:', firstFile)
      }
    } else {
      setFile(null)
    }
  }

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value
    if (selectedValue === 'add-new-option') {
      setOpenDialog(true)
    } else {
      setStorageURL(selectedValue)
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleAddOption = () => {
    if (newOption.trim() !== '' && !constants.storageURLs.includes(newOption)) {
      setStorageURLs(prevStorageURLs => [...prevStorageURLs, newOption])
      setStorageURL(newOption)
      setNewOption('')
      setOpenDialog(false)
    }
  }

  return (
    <form onSubmit={handleUpload}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant='h4'>Upload Form</Typography>
          <Typography color='textSecondary' paragraph>
            Upload files to UHRP Storage
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>UHRP Storage Server URL</InputLabel>
            <Select
              value={storageURL}
              onChange={handleSelectChange}
              label='Storage Server URL'
            >
              {storageURLs.map((url, index) => (
                <MenuItem key={index} value={url.toString()}>
                  {url.toString()}
                </MenuItem>
              ))}
              <MenuItem value='add-new-option'>+ Add New Option</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>Duration</InputLabel>
            <Select
              fullWidth
              label='Duration'
              variant='outlined'
              style={{ width: '100%' }}
              value={hostingMinutes}
              onChange={e => setHostingMinutes(Number(e.target.value))}
              inputProps={{ style: { height: '40px' } }}
            >
              <MenuItem value={180}>3 Hours</MenuItem>
              <MenuItem value={1440}>1 Day</MenuItem>
              <MenuItem value={1440 * 7}>1 Week</MenuItem>
              <MenuItem value={1440 * 30}>1 Month</MenuItem>
              <MenuItem value={1440 * 90}>3 Months</MenuItem>
              <MenuItem value={1440 * 180}>6 Months</MenuItem>
              <MenuItem value={525600}>1 Year</MenuItem>
              <MenuItem value={525600 * 2}>2 Years</MenuItem>
              <MenuItem value={525600 * 5}>5 Years</MenuItem>
              <MenuItem value={525600 * 10}>10 Years</MenuItem>
              <MenuItem value={525600 * 20}>20 Years</MenuItem>
              <MenuItem value={525600 * 30}>30 Years</MenuItem>
              <MenuItem value={525600 * 50}>50 Years</MenuItem>
              <MenuItem value={525600 * 100}>100 Years</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <input type='file' name='file' onChange={handleFileChange} />
        </Grid>
        <Grid item xs={12}>
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Add a New Server URL</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin='dense'
                label='URL'
                type='text'
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
        <Grid item xs={12}>
          <Button
            variant='contained'
            color='primary'
            size='large'
            type='submit'
            disabled={loading || !isFormValid}
            startIcon={<CloudUpload />}
          >
            Upload
          </Button>
        </Grid>
        {loading && (
          <Grid item xs={12}>
            <LinearProgress
              variant={uploadProgress === 0 ? 'indeterminate' : 'determinate'}
              value={uploadProgress}
            />
          </Grid>
        )}
        {results && (
          <Grid item xs={12}>
            <Typography variant='h6'>Upload Successful!</Typography>
            <Typography>
              <b>Payment TXID:</b> {actionTXID}
            </Typography>
            <Typography variant='body1'>
              <b>UHRP URL (can never change, works with all nodes):</b> {results.uhrpURL}
            </Typography>
            <Typography variant='body1'>
              <b>Legacy HTTPS URL (only for this node and commitment, may expire):</b>{' '}
              <a href={results.uhrpURL} target='_blank' rel='noopener noreferrer'>
                {results.uhrpURL}
              </a>
            </Typography>
          </Grid>
        )}
      </Grid>
    </form>
  )
}

export default UploadForm
