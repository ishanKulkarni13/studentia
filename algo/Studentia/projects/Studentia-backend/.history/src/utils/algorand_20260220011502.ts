import algosdk from 'algosdk'
import dotenv from 'dotenv'

dotenv.config()

function loadConfig() {
  const appId = Number(process.env.APP_ID || 0)
  if (!appId) throw new Error('APP_ID env not set')

  const algodServer = process.env.ALGOD_SERVER || ''
  const algodToken = process.env.ALGOD_TOKEN || ''
  const algodPort = Number(process.env.ALGOD_PORT || 443)
  const signerMnemonic = process.env.SIGNER_MNEMONIC || ''

  if (!algodServer) throw new Error('ALGOD_SERVER env not set')
  if (!signerMnemonic) throw new Error('SIGNER_MNEMONIC missing')

  return { appId, algodServer, algodToken, algodPort, signerMnemonic }
}

const config = loadConfig()
const algod = new algosdk.Algodv2(config.algodToken, config.algodServer, config.algodPort)

function getAccount() {
  return algosdk.mnemonicToSecretKey(config.signerMnemonic)
}

function method(name: string) {
  return new algosdk.ABIMethod({
    name,
    args: [
      { name: 'student_id', type: 'string' },
      { name: 'receiver_group', type: 'string' },
      { name: 'data_group', type: 'string' },
    ],
    returns: { type: 'string' },
  })
}

function consentBoxKey(args: { studentId: string; receiverGroup: string; dataGroup: string }) {
  return `${args.studentId}:${args.receiverGroup}:${args.dataGroup}`
}

function decodeBoxUInt64(value: unknown): bigint {
  let bytes: Uint8Array

  if (value instanceof Uint8Array) {
    bytes = value
  } else if (Array.isArray(value)) {
    bytes = Uint8Array.from(value)
  } else if (typeof value === 'string') {
    bytes = Uint8Array.from(Buffer.from(value, 'base64'))
  } else {
    throw new Error('Unexpected box value format')
  }

  if (bytes.length >= 8) {
    return Buffer.from(bytes.slice(0, 8)).readBigUInt64BE(0)
  }
  if (bytes.length === 0) {
    return 0n
  }
  return BigInt(bytes[0])
}

export async function callConsent(
  action: 'grant' | 'revoke',
  args: { studentId: string; receiverGroup: string; dataGroup: string }
) {
  const { appId } = config
  const acct = getAccount()
  const boxKey = consentBoxKey(args)
  const suggested = await algod.getTransactionParams().do()
  suggested.flatFee = true
  suggested.fee = 1000
  const atc = new algosdk.AtomicTransactionComposer()
  atc.addMethodCall({
    appID: appId,
    method: method(action === 'grant' ? 'grant_consent' : 'revoke_consent'),
    sender: acct.addr,
    suggestedParams: suggested,
    signer: algosdk.makeBasicAccountTransactionSigner(acct),
    methodArgs: [args.studentId, args.receiverGroup, args.dataGroup],
    boxes: [
      {
        appIndex: 0,
        name: new TextEncoder().encode(boxKey),
      },
    ],
  })
  const result = await atc.execute(algod, 3)
  const txId = result.txIDs[0]
  const returnValue = result.methodResults[0]?.returnValue as string | undefined
  return { txId, returnValue }
}

export async function getConsentOnChain(args: { studentId: string; receiverGroup: string; dataGroup: string }) {
  const { appId } = config
  const boxKey = consentBoxKey(args)

  try {
    const response = (await algod.getApplicationBoxByName(appId, new TextEncoder().encode(boxKey)).do()) as {
      value?: unknown
    }

    const numeric = decodeBoxUInt64(response.value)
    return {
      boxKey,
      status: numeric === 1n ? 'granted' : 'revoked',
      numeric: Number(numeric),
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.toLowerCase().includes('box not found')) {
      return { boxKey, status: 'none', numeric: null as number | null }
    }
    throw e
  }
}
