interface Constants {
  confederacyURL: URL
  nanostoreURL: URL
  confederacyURLs: URL[] 
  nanostoreURLs: URL[]
}

const confederacyLocalhostURL = new URL('http://localhost:3002')
const nanostoreLocalURL = new URL('http://localhost:3104')
const confederacyDevStagingURL = new URL('https://staging-confederacy.babbage.systems')
const nanostoreDevStagingURL = new URL('https://staging-nanostore.babbage.systems')
const confederacyProdURL = new URL('https://confederacy.babbage.systems')
const nanostoreProdURL = new URL('https://nanostore.babbage.systems')

// Used for Confederacy dropbox
const confederacyURLs = [
  confederacyLocalhostURL,
  confederacyDevStagingURL,
  confederacyProdURL
]

// Used for Nanostore dropbox
const nanostoreURLs = [
  nanostoreLocalURL,
  nanostoreDevStagingURL,
  nanostoreProdURL
]

let constants: Constants

if (window.location.host.startsWith('localhost')) {
  // Local
  constants = {
    confederacyURL: confederacyLocalhostURL,
    nanostoreURL:  nanostoreLocalURL,
    confederacyURLs: confederacyURLs,
    nanostoreURLs: nanostoreURLs
  }
} else if (window.location.host.startsWith('staging') || process.env.NODE_ENV === 'development') {
  // Staging/Development
  constants = {
    confederacyURL:  confederacyDevStagingURL,
    nanostoreURL:  nanostoreDevStagingURL,
    confederacyURLs: confederacyURLs,
    nanostoreURLs: nanostoreURLs
  }
} else {
  // Production
  constants = {
    confederacyURL: confederacyProdURL,
    nanostoreURL: nanostoreProdURL,
    confederacyURLs: confederacyURLs,
    nanostoreURLs: nanostoreURLs
  }
}

export default constants
