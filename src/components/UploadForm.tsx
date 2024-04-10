import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import {
  Button,
  LinearProgress,
  Grid,
  Select,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { publishFile } from 'nanostore-publisher'
import constants from '../utils/constants'

interface UploadFormProps {}

const UploadForm: React.FC<UploadFormProps> = () => {
  const [nanostoreURL, setNanostoreURL] = useState<string>(
    constants.nanostoreURL.toString()
  )
  const [hostingMinutes, setHostingMinutes] = useState<number>(180) // Default: 3 Hours (180 minutes)
  const [loading, setLoading] = useState<boolean>(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [results, setResults] = useState<{ hash: string; publicURL: string } | null>(
    null
  )
  const [actionTXID, setActionTXID] = useState('')

  useEffect(() => {
    setIsFormValid(
      nanostoreURL.trim() !== '' && hostingMinutes >= 180 && file !== null
    )
  }, [nanostoreURL, hostingMinutes, file])

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setActionTXID('')
    try {
      const uploadResult = await publishFile({
        config: {
          nanostoreURL: nanostoreURL
        },
        file: file!,
        retentionPeriod: hostingMinutes,
        progressTracker: (prog: ProgressEvent) => {
          const progress = prog.total > 0 ? (prog.loaded / prog.total) * 100 : 0
          setUploadProgress(progress)
        }
      })

      // Handle upload success
      setResults({
        hash: uploadResult.hash,
        publicURL: uploadResult.publicURL
      })

    } catch (error) {
      console.error(error)
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

  return (
    <form onSubmit={handleUpload}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Upload Form</Typography>
          <Typography color="textSecondary" paragraph>
            Upload files to NanoStore
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="Server URL"
            value={nanostoreURL}
            onChange={e => setNanostoreURL(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Select
            fullWidth
            variant="outlined"
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
        </Grid>
        <Grid item xs={12}>
          <input type="file" name="file" onChange={handleFileChange} />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            type="submit"
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
            <Typography variant="h6">Upload Successful!</Typography>
            <Typography><b>Payment TXID:</b>{' '}{actionTXID}</Typography>
            <Typography variant="body1"><b>UHRP URL (can never change, works with all nodes):</b>{' '}{results.hash}</Typography>
            <Typography variant="body1">
              <b>Legacy HTTPS URL (only for this node and commitment, may expire):</b>{' '}
              <a href={results.publicURL} target="_blank" rel="noopener noreferrer">
                {results.publicURL}
              </a>
            </Typography>
          </Grid>
        )}
      </Grid>
    </form>
  )
}

export default UploadForm
