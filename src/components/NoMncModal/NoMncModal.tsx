import React from 'react'
import { Button, Modal, Box, Typography } from '@mui/material'
import './NoMncModal.scss'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

interface NoMncModalProps {
  open: boolean
  onClose: () => void
}

const NoMncModal: React.FC<NoMncModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style} className="focusBorderNone">
        <Typography id="modal-modal-title" variant="h6" component="h2">
          NanoStore requires the MetaNet Client
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          If you don't have it yet, it can be downloaded on{' '}
          <a
            href="https://projectbabbage.com/desktop/res/MetaNet%20Client.exe"
            target="_blank"
            rel="noopener noreferrer"
          >
            Windows
          </a>
          ,{' '}
          <a
            href="https://projectbabbage.com/desktop/res/MetaNet%20Client.dmg"
            target="_blank"
            rel="noopener noreferrer"
          >
            macOS
          </a>
          , or{' '}
          <a
            href="https://projectbabbage.com/desktop/res/MetaNet%20Client.AppImage"
            target="_blank"
            rel="noopener noreferrer"
          >
            Linux
          </a>
        </Typography>
      </Box>
    </Modal>
  )
}

export default NoMncModal
