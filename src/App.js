import React, { useState } from 'react'
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Tabs,
  Tab,
  LinearProgress
} from '@material-ui/core'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import style from './style'
import { makeStyles } from '@material-ui/core/styles'
import { download } from 'nanoseek'
import { publishFile } from 'nanostore-publisher'
import Upload from '@material-ui/icons/CloudUpload'
import Download from '@material-ui/icons/GetApp'

// Currently no staging nanostore-ui!
const isStaging = Boolean(window.location.host.indexOf('staging') !== -1)

const useStyles = makeStyles(style, {
  name: 'Scratchpad'
})
export default () => {
  const classes = useStyles()
  const [tabIndex, setTabIndex] = useState(1)
  const [downloadURL, setDownloadURL] = useState('')
  const [serverURL, setServerURL] = useState(
    window.location.host.startsWith('localhost')
      ? 'http://localhost:3104'
      : isStaging
        ? 'https://staging-nanostore.babbage.systems'
        : 'https://nanostore.babbage.systems'
  )
  const [confederacyHost, setConfederacyHost] = useState(
    window.location.host.startsWith('localhost')
      ? 'http://localhost:3002'
      : isStaging
        ? 'https://staging-confederacy.babbage.systems'
        : 'https://confederacy.babbage.systems'
  )
  const [hostingMinutes, setHostingMinutes] = useState(180)
  const [file, setFile] = useState(null)
  const [results, setResults] = useState('')
  const [actionTXID, setActionTXID] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDownload = async e => {
    e.preventDefault()
    setResults('')
    setActionTXID('')
    setLoading(true)
    try {
      const { mimeType, data } = await download({
        UHRPUrl: downloadURL,
        confederacyHost
      })
      const blob = new window.Blob([data], { type: mimeType })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = downloadURL
      link.click()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      // Publish the uploaded file
      const uploadResult = await publishFile({
        config: {
          nanostoreURL: serverURL
        },
        file,
        retentionPeriod: hostingMinutes,
        progressTracker: prog => {
          setUploadProgress(
            parseInt((prog.loaded / prog.total) * 100)
          )
        }
      })

      setResults({
        hash: uploadResult.hash,
        publicURL: uploadResult.publicURL
      })
    } catch (e) {
      console.error(e)
      if (e.response && e.response.data && e.response.data.description) {
        toast.error(e.response.data.description)
      } else {
        toast.error(e.message)
      }
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    } else {
      setFile(null)
    }
  }

  return (
    <div className={classes.content_wrap}>
      <ToastContainer />
      <center>
        <Typography variant='h4'>NanoStore UI</Typography>
        <Typography color='textSecondary' paragraph>
          Upload and Download Content
        </Typography>
        <Tabs
          onChange={(e, v) => setTabIndex(v)}
          value={tabIndex}
          indicatorColor='primary'
          textColor='primary'
          variant='fullWidth'
        >
          <Tab label='Download' />
          <Tab label='Upload' />
          <Tab label='Renew (coming soon)' disabled />
        </Tabs>
      </center>
      {tabIndex === 0 && (
        <form onSubmit={handleDownload}>
          <center>
            <br />
            <br />
            <TextField
              variant='outlined'
              label='Confederacy Resolver URL'
              onChange={e => setConfederacyHost(e.target.value)}
              value={confederacyHost}
              fullWidth
            />
            <br />
            <br />
            <TextField
              variant='outlined'
              label='UHRP URL'
              onChange={e => setDownloadURL(e.target.value)}
              value={downloadURL}
              fullWidth
            />
            <br />
            <br />
            <Button
              variant='contained'
              color='primary'
              type='submit'
              startIcon={<Download />}
            >
              Download
            </Button>
            <br />
            <br />
            {loading && <LinearProgress />}
          </center>
        </form>
      )}
      {tabIndex === 1 && (
        <form onSubmit={handleUpload}>
          <br />
          <br />
          <Typography variant='h5'>Server URL</Typography>
          <Typography paragraph>
            Enter the URL of the NanoStore server to interact with
          </Typography>
          <TextField
            fullWidth
            variant='outlined'
            label='Server URL'
            value={serverURL}
            onChange={e => setServerURL(e.target.value)}
          />
          <br />
          <br />
          <Typography variant='h5'>Hosting Duration</Typography>
          <Typography paragraph>Longer hosting contracts cost more</Typography>
          <Select
            onChange={e => setHostingMinutes(e.target.value)}
            value={hostingMinutes}
            variant='outlined'
            size='large'
            fullWidth
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
          <br />
          <br />
          <Typography variant='h5'>File to Host</Typography>
          <Typography paragraph>
            Choose the file that you want the NanoStore server to host
          </Typography>
          <input type='file' name='file' onChange={handleFileChange} />
          <Typography paragraph>
            Files are advertised <b>PUBLICLY</b>, please encrypt sensitive data before uploading.
          </Typography>
          <br />
          <br />
          <center className={classes.broadcast_wrap}>
            <Button
              variant='contained'
              color='primary'
              size='large'
              type='submit'
              disabled={loading}
              startIcon={<Upload />}
            >
              Upload
            </Button>
            <br />
            <br />
            {loading && (
              <LinearProgress
                variant={uploadProgress === 0 ? 'indeterminate' : 'determinate'}
                value={uploadProgress === 0 ? undefined : uploadProgress}
              />
            )}
            {results && (
              <div>
                <Typography variant='h4'>Success!</Typography>
                <Typography><b>Payment TXID:</b>{' '}{actionTXID}</Typography>
                <Typography><b>UHRP URL (can never change, works with all nodes):</b>{' '}{results.hash}</Typography>
                <Typography>
                  <b>Legacy HTTPS URL (only for this node and commitment, may expire):</b>{' '}
                  <a
                    href={results.publicURL}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {results.publicURL}
                  </a>
                </Typography>
              </div>
            )}
          </center>
        </form>
      )}
      <br />
      <br />
      <Typography align='center' paragraph>
        Check out the <a href='https://projectbabbage.com/docs/nanostore/concepts/uhrp'>Universal Hash Resolution Protocol</a>!
      </Typography>
      <Typography align='center'>
        <a href='https://projectbabbage.com'>www.ProjectBabbage.com</a>
      </Typography>
    </div>
  )
}
