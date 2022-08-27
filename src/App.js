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
import { Blob } from 'Blob'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import style from './style'
import { makeStyles } from '@material-ui/core/styles'
import { getPaymail } from '@babbage/sdk'
import { download } from 'nanoseek'
import { invoice, pay, upload } from 'nanostore-publisher'
import Upload from '@material-ui/icons/CloudUpload'
import Download from '@material-ui/icons/GetApp'

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
      : process.env.REACT_APP_IS_STAGING
        ? 'https://staging-nanostore.babbage.systems'
        : 'https://nanostore.babbage.systems'
  )
  const [bridgeportResolver, setBridgeportResolver] = useState(
    window.location.host.startsWith('localhost')
      ? 'http://localhost:3103'
      : 'https://bridgeport.babbage.systems'
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
        URL: downloadURL,
        bridgeportResolvers: [bridgeportResolver]
      })
      const blob = new Blob([data], { type: mimeType })
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
      if (!file) {
        const e = new Error('Choose a file to upload!')
        e.code = 'ERR_UI_FILE_MISSING'
        throw e
      }
      if (!hostingMinutes) {
        const e = new Error('Specify how long to host the file!')
        e.code = 'ERR_UI_HOST_DURATION_MISSING'
        throw e
      }
      const invoiceResult = await invoice({
        fileSize: file.size,
        retentionPeriod: hostingMinutes,
        serverURL
      })
      console.log('App():invoiceResult:', invoiceResult)
      if (invoiceResult.status === 'error') {
        console.log(invoiceResult)
        const e = new Error('Invoice creation has failed.')
        e.code = 'ERR_INVOICE_CREATION_FAILED'
        throw e
      }
      const payResult = await pay({
        sender: await getPaymail(),
        recipient: invoiceResult.paymail,
        amount: invoiceResult.amount,
        description: 'Payment to nanostore account.',
        orderID: invoiceResult.ORDER_ID
      })
      console.log('App():payResult:', payResult)
      if (payResult.status === 'error') {
        console.log(payResult)
        const e = new Error('Paying invoice has failed.')
        e.code = 'ERR_PAY_INVOICE_FAILED'
        throw e
      }
      const uploadResult = await upload({
        uploadURL: payResult.uploadURL,
        publicURL: invoiceResult.publicURL,
        file,
        serverURL,
        onUploadProgress: prog => {
          setUploadProgress(
            parseInt((prog.loaded / prog.total) * 100)
          )
        }
      })
      if (uploadResult.status === 'error') {
        console.log(uploadResult)
        const e = new Error('Uploading file has failed.')
        e.code = 'ERR_UPLOAD_FILE_FAILED'
        throw e
      }
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
              label='Bridgeport Resolver URL'
              onChange={e => setBridgeportResolver(e.target.value)}
              value={bridgeportResolver}
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
        Check out the <a href='https://bridgeport.babbage.systems/1AJsUZ7MsJGwmkCZSoDpro28R52ptvGma7'>Universal Hash Resolution Protocol</a>!
      </Typography>
      <Typography align='center'>
        <a href='https://projectbabbage.com'>www.ProjectBabbage.com</a>
      </Typography>
    </div>
  )
}
