import React, { useState } from 'react'
import {
  TextField,
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
import Babbage from '@babbage/sdk'
import { download } from 'nanoseek'
import { invoice, upload } from 'nanostore-publisher'

const useStyles = makeStyles(style, {
  name: 'Scratchpad'
})

export default () => {
  const classes = useStyles()
  const [tabIndex, setTabIndex] = useState(1)
  const [downloadURL, setDownloadURL] = useState('')
  const [serverURL, setServerURL] = useState(
    process.env.NODe_ENV !== 'production'
      ? 'https://staging-nanostore.babbage.systems'
      : 'https://nanostore.babbage.systems'
  )
  const [hostingMinutes, setHostingMinutes] = useState(60)
  const [file, setFile] = useState(null)
  const [results, setResults] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDownload = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { mimeType, data } = await download({ URL: downloadURL })
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
        throw new Error('Choose a file to upload!')
      }
      if (!hostingMinutes) {
        throw new Error('Specify how long to host the file!')
      }
      const inv = await invoice({
        fileSize: file.size,
        retentionPeriod: hostingMinutes,
        serverURL
      })
      console.log(inv)

      const tx = await Babbage.createAction({
        outputs: inv.outputs.map(x => ({
          satoshis: x.amount,
          script: x.outputScript
        })),
        keyName: 'primarySigning',
        keyPath: 'm/1033/1',
        description: 'Upload with NanoStore',
        labels: ['nanostore']
      })
      console.log(tx)

      const response = await upload({
        referenceNumber: inv.referenceNumber,
        transactionHex: tx.rawTransaction,
        file,
        serverURL
      })

      setResults({
        txid: tx.txid,
        hash: response.hash,
        publicURL: response.publicURL
      })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
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
            Enter the URL of the Hashbrown server to interact with
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
          <Typography paragraph>
            Enter the number of minutes to host the file (only whole numbers)
          </Typography>
          <TextField
            fullWidth
            variant='outlined'
            type='number'
            label='Hosting Minutes'
            value={hostingMinutes}
            onChange={e => setHostingMinutes(e.target.value)}
          />
          <br />
          <br />
          <Typography variant='h5'>File to Host</Typography>
          <Typography paragraph>
            Choose the file that you want the Hashbrown server to host
          </Typography>
          <input type='file' name='file' onChange={handleFileChange} />
          <br />
          <br />
          <center className={classes.broadcast_wrap}>
            <Button
              variant='contained'
              color='primary'
              size='large'
              type='submit'
              disabled={loading}
            >
              Upload
            </Button>
            <br />
            <br />
            {loading && <LinearProgress />}
            {results && (
              <div>
                <Typography variant='h4'>Success!</Typography>
                <Typography><b>TXID:</b>{' '}{results.txid}</Typography>
                <Typography><b>UHRP URL:</b>{' '}{results.hash}</Typography>
                <Typography>
                  <b>Public URL:</b>{' '}
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
    </div>
  )
}
