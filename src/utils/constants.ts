interface Constants {
  storageURL: string
  storageURLs: string[]
}

// Local, Staging, and Production URLs for your storage
const storageProdURL = 'https://nanostore.babbage.systems'
const storageStagingURL = 'https://staging-nanostore.babbage.systems'
const storageLocalURL = 'http://localhost:3104'

// List of possible storage URLs (used for drop-downs, etc.)
const storageURLs = [storageProdURL, storageStagingURL, storageLocalURL ]

let constants: Constants

if (window.location.host.startsWith('localhost')) {
  // Local
  constants = {
    storageURL: storageLocalURL,
    storageURLs: storageURLs
  }
} else if (
  window.location.host.startsWith('staging') ||
  process.env.NODE_ENV === 'development'
) {
  // Staging/Development
  constants = {
    storageURL: storageStagingURL,
    storageURLs: storageURLs
  }
} else {
  // Production
  constants = {
    storageURL: storageProdURL,
    storageURLs: storageURLs
  }
}

export default constants
