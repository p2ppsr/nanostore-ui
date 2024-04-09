import React, { useState } from 'react'
import { Container, Typography, Tabs, Tab, Grid } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import useAsyncEffect from 'use-async-effect'
import checkForMetaNetClient from './utils/checkForMetaNetClient'
import NoMncModal from './components/NoMncModal/NoMncModal'
import DownloadForm from './components/DownloadForm'
import UploadForm from './components/UploadForm'
import Footer from './components/Footer'

import './App.scss'

const App: React.FC = () => {
  console.log('->App()')
  const [tabIndex, setTabIndex] = useState<number>(0)
  const [isMncMissing, setIsMncMissing] = useState<boolean>(false)
  //const classes = useStyles()

  useAsyncEffect(() => {
    const fetchMNCStatus = async () => {
      const hasMNC = await checkForMetaNetClient()
      setIsMncMissing(hasMNC === 0)
    }

    fetchMNCStatus()

    return () => {
      // Cleanup logic if needed
    }
  }, [])

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue)
  }
  console.log('<-App()')
  return (
      <Container maxWidth="sm">
        <NoMncModal open={isMncMissing} onClose={() => setIsMncMissing(false)} />
        <Grid container spacing={2}>
          <ToastContainer />
          <Grid item xs={12}>
            <Typography variant="h4" align="center">
              NanoStore UI
            </Typography>
            <Typography color="textSecondary" paragraph align="center">
              Upload and Download Content
            </Typography>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Download" />
              <Tab label="Upload" />
              <Tab label="Renew (coming soon)" disabled />
            </Tabs>
          </Grid>
          <Grid item xs={12}>
            {tabIndex === 0 && <DownloadForm />}
            {tabIndex === 1 && <UploadForm />}
          </Grid>
          <Grid item xs={12}>
            <Footer />
          </Grid>
        </Grid>
      </Container>
  )
}

export default App
