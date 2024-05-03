import { getNetwork } from '@babbage/sdk-ts'

export default async function checkForMetaNetClient() {
  try {
    const result = await getNetwork()
    if (result === 'mainnet' || result === 'testnet') {
      return 1
    } else {
      return -1
    }
  } catch (e) {
    return 0
  }
}