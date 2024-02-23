import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Prompt from '@babbage/react-prompt'

ReactDOM.render(
  <Prompt
    appName='NanoStore UI'
    customPrompt
    author='Peer-to-peer Privacy Systems Research, LLC'
    authorUrl='https://projectbabbage.com'
    description='NanoStore makes it effortless for apps and users alike to buy hosting and syndication for the things they want to create and share.'
    appIcon='/nanostoreLogoIconLgt.svg'
    supportedMetaNet='universal'
    appImages={[
      '/nanostore-ui.png'
    ]}
  >
    <App />
  </Prompt>,
  document.getElementById('root')
)
