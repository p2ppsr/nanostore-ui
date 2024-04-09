interface Constants {
  confederacyURL: URL
  nanostoreURL: URL
}

let constants: Constants

if (window.location.host.startsWith('localhost')) {
  constants = {
    // For testing
    //confederacyURL:  new URL('https://staging-confederacy.babbage.systems'),
    confederacyURL: new URL('http://localhost:3002'),
    nanostoreURL:  new URL('http://localhost:3104')
  }
} else if (window.location.host.startsWith('staging') || process.env.NODE_ENV === 'development') {
  // Staging/Development
  constants = {
    confederacyURL:  new URL('https://staging-confederacy.babbage.systems'),
    nanostoreURL:  new URL('https://staging-nanostore.babbage.systems')
  }
} else {
  // Production
  constants = {
    confederacyURL: new URL('https://confederacy.babbage.systems'),
    nanostoreURL: new URL('https://nanostore.babbage.systems')
  }
}

export default constants
