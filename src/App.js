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
import { invoice, pay } from 'byteshop-publisher'
import Buy from '@material-ui/icons/GetApp'

const {
  REACT_APP_IS_STAGING
} = process.env
const isStaging = Boolean(REACT_APP_IS_STAGING)
const useStyles = makeStyles(style, {
  name: 'Scratchpad'
})
export default () => {
  const classes = useStyles()
  const [tabIndex, setTabIndex] = useState(0)
  const [serverURL, setServerURL] = useState(
    window.location.host.startsWith('localhost')
      ? 'http://localhost:3104'
      : isStaging
        ? 'https://staging-byteshop.babbage.systems'
        : 'https://byteshop.babbage.systems'
  )
  const [numberOfBytes, setNumberOfBytes] = useState(14)
  const [results, setResults] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleBuy = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!numberOfBytes) {
        const e = new Error('Specify the number of bytes > 10!')
        e.code = 'ERR_MISSING_NUMBER_OF_BYTES'
        throw e
      }
      const invoiceResult = await invoice({
        config: {
          byteshopURL: serverURL
        },
        numberOfBytes
      })
      console.log('App():invoiceResult:', invoiceResult)
      const payResult = await pay({
        config: {
          byteshopURL: serverURL
        },
        description: 'Buy with Byteshop UI',
        orderID: invoiceResult.ORDER_ID,
        recipientPublicKey: invoiceResult.identityKey,
        amount: invoiceResult.amount
      })
      console.log('App():payResult:', payResult)
      setResults({
        bytes: payResult.bytes,
        note: payResult.note
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
  return (
    <div className={classes.content_wrap}>
      <ToastContainer />
      <center>
        <Typography variant='h4'>Byteshop UI</Typography>
        <br />
        <br />
        <Tabs
          onChange={(e, v) => setTabIndex(v)}
          value={tabIndex}
          indicatorColor='primary'
          textColor='primary'
          variant='fullWidth'
        >
          <Tab label='Buy bytes' />
        </Tabs>
      </center>
      {tabIndex === 0 && (
        <form onSubmit={handleBuy}>
          <br />
          <br />
          <Typography variant='h5'>Server URL</Typography>
          <Typography paragraph>
            Enter the URL of the Byteshop server to interact with
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
          <br />
          <Typography paragraph>
            Enter number of bytes to be purchased greater than 10
          </Typography>
          <TextField
            fullWidth
            variant='outlined'
            label='Number of bytes'
            value={numberOfBytes}
            onChange={e => setNumberOfBytes(e.target.value)}
          />
          <center className={classes.broadcast_wrap}>
            <Button
              variant='contained'
              color='primary'
              size='large'
              type='submit'
              disabled={loading}
              startIcon={<Buy />}
            >
              Buy
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
                <Typography><b>Your bytes:</b>{' '}{results.bytes}</Typography>
                <Typography><b>Note:</b>{' '}{results.note}</Typography>
                <Typography>
                  <b>Legacy HTTPS URL (only for this node and commitment, may expire):</b>{' '}
                </Typography>
              </div>
            )}
          </center>
        </form>
      )}
      <br />
      <Typography align='center'>
        <a href='https://projectbabbage.com'>www.ProjectBabbage.com</a>
      </Typography>
    </div>
  )
}
