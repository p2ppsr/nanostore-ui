import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Prompt from '@babbage/react-prompt'

ReactDOM.render(
  <Prompt appName='Byteshop UI'>
    <App />
  </Prompt>,
  document.getElementById('root')
)
