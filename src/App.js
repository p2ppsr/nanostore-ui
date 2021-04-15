import React, { useState } from 'react'
import {
  TextField,
  Button,
  Typography,
  Tabs,
  Tab
} from '@material-ui/core'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import boomerang from '@cwi/boomerang'
import style from './style'
import { makeStyles } from '@material-ui/core/styles'
import Babbage from '@babbage/sdk'
import { post } from 'axios'
import parapet from 'parapet-js'
import { getHashFromURL } from 'uhrp-url'

const useStyles = makeStyles(style, {
  name: 'Scratchpad'
})

export default () => {
  const classes = useStyles()
  const [tabIndex, setTabIndex] = useState(1)
  const [downloadURL, setDownloadURL] = useState('')
  const [serverURL, setServerURL] = useState(
    'https://hashbrown.babbage.systems'
  )
  const [hostingMinutes, setHostingMinutes] = useState(60)
  const [file, setFile] = useState(null)
  const [resultTXID, setResultTXID] = useState('')

  const download = async e => {
    e.preventDefault()
    const hash = getHashFromURL(downloadURL).toString('hex')
    const resolved = await parapet({
      bridge: '1AJsUZ7MsJGwmkCZSoDpro28R52ptvGma7',
      request: {
        type: 'json-query',
        query: {
          v: 3,
          q: {
            collection: 'content',
            find: {
              hash,
              revoked: false
            }
          }
        }
      }
    })
    if (resolved.length > 0) {
      const urls = resolved.map(x => x.URL)
      alert(`You can download it from:\n\n${JSON.stringify(urls)}`)
    } else {
      toast.error('No Hashbrown host advertises this hash!')
    }
  }

  const upload = async e => {
    e.preventDefault()
    try {
      if (!file) {
        throw new Error('Choose a file to upload!')
      }
      if (!hostingMinutes) {
        throw new Error('Specify how long to host the file!')
      }
      const invoice = await boomerang('POST', `${serverURL}/invoice`, {
        fileSize: file.size,
        retentionPeriod: hostingMinutes
      })
      if (!invoice || !invoice.referenceNumber) {
        throw new Error(invoice.description || 'Error creating invoice!')
      }
      console.log(invoice)

      const tx = await Babbage.ninja.getTransactionWithOutputs({
        outputs: invoice.outputs.map(x => ({
          satoshis: x.amount,
          script: x.outputScript
        }))
      })
      console.log(tx)

      // Upload and pay for the file
      const data = new window.FormData()
      data.append('file', file)
      data.append('referenceNumber', invoice.referenceNumber)
      data.append('transactionHex', tx.hex)
      console.log(data)

      const config = {
        headers: {
          'content-type': 'multipart/form-data'
        }
      }

      const { data: response } = await post(`${serverURL}/upload`, data, config)
      console.log(response)

      const txid = await Babbage.ninja.processOutgoingTransaction({
        submittedTransaction: tx.hex,
        reference: tx.reference,
        note: 'Upload a file with Hashbrown UI'
      })
      console.log(txid)

      setResultTXID(txid.note)
      window.alert(
        `Broadcasted! TXID:${txid}\n\nUHRP URL: ${response.hash}\n\nPublic URL: ${response.publicURL}`
      )
    } catch (e) {
      toast.error(e.message)
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
        <Typography variant='h4'>Hashbrown UI</Typography>
        <Typography color='textSecondary' paragraph>
          UI for Hashbrown Interactions
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
        <form onSubmit={download}>
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
          </center>
        </form>
      )}
      {tabIndex === 1 && (
        <form onSubmit={upload}>
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
            >
              Upload
            </Button>
            {resultTXID && (
              <Typography>Success! TXID: {resultTXID}</Typography>
            )}
          </center>
        </form>
      )}
    </div>
  )
}
