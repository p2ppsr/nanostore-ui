import { getNetwork } from '@babbage/sdk-ts'

// Return values
const NETWORK_FOUND = 1
const NETWORK_NOT_FOUND = -1

export default async function checkForMetaNetClient() {
  try {
    const result = await getNetwork()

    // Check if result is valid
    if (result === 'mainnet' || result === 'testnet') {
      return NETWORK_FOUND
    }
  } catch (e: any) {
    // Log the error for debugging purposes
    console.error('Error checking MetaNet client:', e.message)
    if (
      e.message.includes('The user does not have a current MetaNet Identity')
    ) {
      return NETWORK_NOT_FOUND
    }
  }
}
