import bs58 from 'bs58'
import { generateKeyPair } from 'crypto'
import { promisify } from 'util'
import type { GillWalletInfo, GillNetworkConfig } from './types'
import {
  createTrezoaRpc,
  createKeyPairSignerFromBytes,
  lamports,
  type Address,
  type Rpc,
  type TrezoaRpcApi,
} from 'gill'

const generateKeyPairAsync = promisify(generateKeyPair)

export function createGillWalletClient(config: GillNetworkConfig) {
  const networkUrls = {
    devnet: process.env.DEVNET_RPC_URL || 'https://api.devnet.trezoa.com',
    mainnet: process.env.MAINNET_RPC_URL || 'https://api.mainnet-beta.trezoa.com',
    testnet: process.env.TESTNET_RPC_URL || 'https://api.testnet.trezoa.com',
  }

  const rpcUrl = config.rpcUrl || networkUrls[config.network as keyof typeof networkUrls]
  const rpc = createTrezoaRpc(rpcUrl)

  return { rpc }
}

export async function generateGillWallet(name: string): Promise<GillWalletInfo> {
  const { privateKey, publicKey } = await generateKeyPairAsync('ed25519', {
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    publicKeyEncoding: { type: 'spki', format: 'der' },
  })

  const privateKeyBytes = privateKey.slice(-32)

  const publicKeyBytes = publicKey.slice(-32)

  const secretKeyBytes = new Uint8Array(64)
  secretKeyBytes.set(privateKeyBytes, 0)
  secretKeyBytes.set(publicKeyBytes, 32)

  const signer = await createKeyPairSignerFromBytes(secretKeyBytes)

  return {
    name,
    address: signer.address,
    keypairFile: `${name}.json`,
    privateKey: {
      hex: Buffer.from(privateKeyBytes).toString('hex'),
      base58: bs58.encode(privateKeyBytes),
      array: Array.from(privateKeyBytes),
    },
    secretKey: {
      hex: Buffer.from(secretKeyBytes).toString('hex'),
      base58: bs58.encode(secretKeyBytes),
      array: Array.from(secretKeyBytes),
    },
    balance: '0 TRZ',
    funded: false,
    signer, // Include the Gill signer
  }
}

export async function createGillWalletFromKey(name: string, privateKeyInput: string): Promise<GillWalletInfo> {
  let secretKeyArray: number[]

  if (privateKeyInput.length === 128) {
    const secretKeyBuffer = Buffer.from(privateKeyInput, 'hex')
    secretKeyArray = Array.from(secretKeyBuffer)
  } else if (privateKeyInput.length === 88) {
    const secretKeyBuffer = bs58.decode(privateKeyInput)
    secretKeyArray = Array.from(secretKeyBuffer)
  } else {
    throw new Error('Invalid private key format. Expected 128 char hex or 88 char base58')
  }

  const privateKeyBytes = new Uint8Array(secretKeyArray)
  const signer = await createKeyPairSignerFromBytes(privateKeyBytes)
  const privateKey = secretKeyArray.slice(0, 32)

  return {
    name,
    address: signer.address,
    keypairFile: `${name}.json`,
    privateKey: {
      hex: Buffer.from(privateKey).toString('hex'),
      base58: bs58.encode(new Uint8Array(privateKey)),
      array: privateKey,
    },
    secretKey: {
      hex: privateKeyInput.length === 128 ? privateKeyInput : Buffer.from(secretKeyArray).toString('hex'),
      base58: privateKeyInput.length === 88 ? privateKeyInput : bs58.encode(new Uint8Array(secretKeyArray)),
      array: secretKeyArray,
    },
    signer, // Include the Gill signer
  }
}

export async function checkGillWalletBalance(rpc: Rpc<TrezoaRpcApi>, walletAddress: Address): Promise<number> {
  try {
    const balance = await rpc.getBalance(walletAddress).send()
    return Number(balance.value) / 1e9 // Convert lamports to TRZ
  } catch (error) {
    console.error(`❌ Error checking balance for ${walletAddress}:`, error)
    return 0
  }
}

export async function requestGillAirdrop(
  rpc: Rpc<TrezoaRpcApi>,
  walletAddress: Address,
  amount: number = 2,
): Promise<boolean> {
  try {
    console.log(`💧 Requesting ${amount} TRZ airdrop for ${walletAddress}...`)

    const signature = await rpc.requestAirdrop(walletAddress, lamports(BigInt(amount * 1e9))).send()

    let confirmed = false
    let attempts = 0
    const maxAttempts = 30

    while (!confirmed && attempts < maxAttempts) {
      try {
        const result = await rpc.getSignatureStatuses([signature]).send()
        if (
          result.value[0]?.confirmationStatus === 'confirmed' ||
          result.value[0]?.confirmationStatus === 'finalized'
        ) {
          confirmed = true
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          attempts++
        }
      } catch {
        attempts++
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    if (confirmed) {
      console.log(`✅ Airdrop successful! Signature: ${signature}`)
      // Wait a bit for balance to update
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return true
    } else {
      console.error(`❌ Airdrop confirmation timeout for ${walletAddress}`)
      return false
    }
  } catch (error) {
    console.error(`❌ Airdrop failed for ${walletAddress}:`, error)
    return false
  }
}

export async function updateGillWalletStatus(rpc: Rpc<TrezoaRpcApi>, wallet: GillWalletInfo): Promise<GillWalletInfo> {
  const balance = await checkGillWalletBalance(rpc, wallet.address)
  return {
    ...wallet,
    balance: `${balance} TRZ`,
    funded: balance > 0,
  }
}

export async function ensureGillWalletFunded(
  rpc: Rpc<TrezoaRpcApi>,
  wallet: GillWalletInfo,
  minBalance: number = 1,
  airdropAmount: number = 2,
): Promise<GillWalletInfo> {
  const updatedWallet = await updateGillWalletStatus(rpc, wallet)
  const balance = parseFloat(updatedWallet.balance?.split(' ')[0] || '0')

  if (balance < minBalance) {
    console.log(`💧 Wallet needs funding (current: ${balance} TRZ, required: ${minBalance} TRZ)...`)
    const airdropSuccess = await requestGillAirdrop(rpc, wallet.address, airdropAmount)

    if (airdropSuccess) {
      return await updateGillWalletStatus(rpc, updatedWallet)
    } else {
      console.log('⚠️  Automatic airdrop failed. Please fund manually:')
      console.log(`trezoa airdrop ${airdropAmount} ${wallet.address} --url devnet`)
      return updatedWallet
    }
  }

  return updatedWallet
}

export async function fundPrimaryWallet(
  rpc: Rpc<TrezoaRpcApi>,
  wallet: GillWalletInfo,
  requiredAmount: number = 5,
): Promise<GillWalletInfo> {
  const balance = await checkGillWalletBalance(rpc, wallet.address)

  if (balance < requiredAmount) {
    console.log(`💧 Funding primary wallet with ${requiredAmount} TRZ...`)
    const airdropSuccess = await requestGillAirdrop(rpc, wallet.address, requiredAmount)

    if (!airdropSuccess) {
      throw new Error(`Failed to fund primary wallet ${wallet.address}`)
    }

    return await updateGillWalletStatus(rpc, wallet)
  }

  console.log(`✅ Primary wallet already has ${balance} TRZ (required: ${requiredAmount} TRZ)`)
  return wallet
}

export async function distributeSolToWallets(
  rpc: Rpc<TrezoaRpcApi>,
  fromWallet: GillWalletInfo,
  toWallets: GillWalletInfo[],
  amountPerWallet: number = 0.1,
): Promise<GillWalletInfo[]> {
  if (!fromWallet.signer) {
    throw new Error('Primary wallet must have signer to distribute TRZ')
  }

  console.log(`📤 Distributing ${amountPerWallet} TRZ to ${toWallets.length} wallets...`)
  console.log(`💰 From wallet: ${fromWallet.address} (${fromWallet.keypairFile})`)

  const updatedWallets: GillWalletInfo[] = []

  for (const wallet of toWallets) {
    try {
      console.log(`💸 Sending ${amountPerWallet} TRZ to ${wallet.address}...`)

      const { execSync } = require('child_process')

      let keypairFile = fromWallet.keypairFile || 'trezoaanchor/deploy-wallet.json'

      if (keypairFile === 'deploy-wallet.json' && !process.cwd().endsWith('/trezoaanchor')) {
        keypairFile = 'trezoaanchor/deploy-wallet.json'
      }
      const result = execSync(
        `trezoa transfer ${wallet.address} ${amountPerWallet} --allow-unfunded-recipient --keypair ${keypairFile} --url devnet`,
        { encoding: 'utf8', cwd: process.cwd() },
      )

      // Extract signature from output
      const signatureMatch = result.match(/Signature: ([A-Za-z0-9]+)/)
      const signature = signatureMatch ? signatureMatch[1] : 'unknown'

      const updatedWallet = {
        ...wallet,
        balance: `${amountPerWallet} TRZ`,
        funded: true,
      }

      updatedWallets.push(updatedWallet)
      console.log(`✅ Transferred to ${wallet.address} (${signature})`)

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`❌ Failed to transfer to ${wallet.address}:`, error)
      updatedWallets.push({
        ...wallet,
        balance: '0 TRZ',
        funded: false,
      })
    }
  }

  return updatedWallets
}

export async function generateGillTestWallets(rpc: Rpc<TrezoaRpcApi>, count: number): Promise<GillWalletInfo[]> {
  const testWallets: GillWalletInfo[] = []

  for (let i = 1; i <= count; i++) {
    console.log(`📱 Creating test wallet ${i}...`)
    const wallet = await generateGillWallet(`test-wallet-${i}`)
    console.log(`✅ Created: ${wallet.address}`)
    testWallets.push(wallet)
  }

  return testWallets
}

export async function createPrimaryWalletFromInput(
  walletInput: string | null,
  walletName: string = 'deploy-wallet',
): Promise<GillWalletInfo> {
  if (!walletInput) {
    console.log(`🔑 Creating new ${walletName}...`)
    return await generateGillWallet(walletName)
  } else {
    console.log(`🔐 Using provided private key for ${walletName}...`)
    return await createGillWalletFromKey(walletName, walletInput)
  }
}

export async function setupEfficientWalletFunding(
  rpc: Rpc<TrezoaRpcApi>,
  primaryWallet: GillWalletInfo,
  testWallets: GillWalletInfo[],
  distributionAmount: number = 0.1,
): Promise<{
  primaryWallet: GillWalletInfo
  testWallets: GillWalletInfo[]
}> {
  const primaryWalletAmount = 5
  const totalDistribution = testWallets.length * distributionAmount

  console.log(`🎯 Setting up efficient funding:`)
  console.log(`   • Primary wallet: ${primaryWalletAmount} TRZ airdrop`)
  console.log(`   • Distribution: ${distributionAmount} TRZ × ${testWallets.length} wallets = ${totalDistribution} TRZ`)
  console.log(`   • Remaining: ~${(primaryWalletAmount - totalDistribution).toFixed(2)} TRZ for fees and buffer`)

  const fundedPrimary = await fundPrimaryWallet(rpc, primaryWallet, primaryWalletAmount)

  const fundedTestWallets = await distributeSolToWallets(rpc, fundedPrimary, testWallets, distributionAmount)

  return {
    primaryWallet: fundedPrimary,
    testWallets: fundedTestWallets,
  }
}
