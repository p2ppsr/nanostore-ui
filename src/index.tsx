import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import App from './App'
import web3Theme from './theme'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Failed to find the root element')
}

const root = ReactDOM.createRoot(rootElement)
root.render(
  <ThemeProvider theme={web3Theme}>
    <ToastContainer
      position='top-center'
      autoClose={5000} // auto close after 5 seconds
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false} // set to true if you're using a right-to-left language
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <CssBaseline />
    <App />
  </ThemeProvider>
)
