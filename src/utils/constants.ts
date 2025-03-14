interface Constants {
  confederacyURL: string
  storageURL: string
  confederacyURLs: string[] 
  storageURLs: string[]
}

const confederacyLocalhostURL = 'http://localhost:3002'
const storageLocalURL = 'http://localhost:3104'
const confederacyDevStagingURL = 'https://staging-confederacy.babbage.systems'// TODO CHANGE ALL OF THESE
const storageDevStagingURL = 'https://staging-nanostore.babbage.systems'
const confederacyProdURL = 'https://confederacy.babbage.systems'
const storageProdURL = 'https://nanostore.babbage.systems'

// Used for Confederacy dropbox
const confederacyURLs = [
  confederacyLocalhostURL,
  confederacyDevStagingURL,
  confederacyProdURL
]

// Used for Nanostore dropbox
const storageURLs = [
  storageLocalURL,
  storageDevStagingURL,
  storageProdURL
]

let constants: Constants

if (window.location.host.startsWith('localhost')) {
  // Local
  constants = {
    confederacyURL: confederacyLocalhostURL,
    storageURL:  storageLocalURL,
    confederacyURLs: confederacyURLs,
    storageURLs: storageURLs
  }
} else if (window.location.host.startsWith('staging') || process.env.NODE_ENV === 'development') {
  // Staging/Development
  constants = {
    confederacyURL:  confederacyDevStagingURL,
    storageURL:  storageDevStagingURL,
    confederacyURLs: confederacyURLs,
    storageURLs: storageURLs
  }
} else {
  // Production
  constants = {
    confederacyURL: confederacyProdURL,
    storageURL: storageProdURL,
    confederacyURLs: confederacyURLs,
    storageURLs: storageURLs
  }
}

export default constants
