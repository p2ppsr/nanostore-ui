import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import App from './App'
import web3Theme from './theme'
import { ToastContainer, ToastPosition } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const toastOptions = {
  position: 'top-center' as ToastPosition,
  autoClose: 5000,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true
}

const rootElement = document.getElementById('root')

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement as HTMLElement)
  root.render(
    <ThemeProvider theme={web3Theme}>
      <CssBaseline />
      <App />
      <ToastContainer {...toastOptions} />
    </ThemeProvider>
  )
} else {
  console.error('Root element not found!')
}
