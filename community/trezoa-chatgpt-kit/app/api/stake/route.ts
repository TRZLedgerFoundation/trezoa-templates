import { NextResponse } from 'next/server'
import { VersionedTransaction, PublicKey } from '@trezoa/web3.js'
import {
  getTrezoaConnection,
  getWalletKeypair,
  JUPITER_API,
  TOKENS,
  TOKEN_DECIMALS,
  JUPTRZ_MINT,
  LST_DECIMALS,
  externalWallet,
} from '@/lib/trezoa-config'

type TokenInfo = {
  address: string
  symbol: string
  name: string
  decimals: number
  tags?: string[]
}

function isMint(s: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)
}

async function resolveLstMintAndDecimals(param?: string): Promise<{ mint: string; decimals: number; symbol: string }> {
  const desiredRaw = (param || 'JupTRZ').trim()
  if (isMint(desiredRaw)) {
    // Assume 9 decimals for LSTs; Jupiter quote returns outAmount in base units
    return { mint: desiredRaw, decimals: 9, symbol: desiredRaw }
  }

  const desired = desiredRaw.replace(/^\$/i, '')
  if (desired.toLowerCase() === 'juptrz') {
    return { mint: JUPTRZ_MINT, decimals: LST_DECIMALS.JUPTRZ || 9, symbol: 'JupTRZ' }
  }

  // If symbol not recognized and not a mint, require a contract address
  throw new Error(`Unknown LST. Provide a mint address or use 'JupTRZ'.`)
}

export async function POST(request: Request) {
  try {
    const { amount, lst, userPublicKey } = await request.json()
    console.log('[STAKE] incoming:', { amount, lst, userPublicKey, externalWallet })

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
    }

    // Validate userPublicKey when using external wallet
    if (externalWallet && !userPublicKey) {
      return NextResponse.json({ error: 'userPublicKey is required when using external wallet' }, { status: 400 })
    }

    const connection = getTrezoaConnection()
    const wallet = externalWallet ? null : getWalletKeypair()
    const publicKeyString = externalWallet ? userPublicKey : wallet!.publicKey.toString()

    // Input is TRZ → output is LST (default JupTRZ)
    const inputMint = TOKENS.TRZ
    const inputDecimals = TOKEN_DECIMALS.TRZ || 9
    const scaledAmount = Math.floor(parseFloat(amount) * Math.pow(10, inputDecimals))

    const { mint: lstMint, decimals: lstDecimals, symbol: lstSymbol } = await resolveLstMintAndDecimals(lst)
    console.log('[STAKE] resolved LST:', { lstMint, lstDecimals, lstSymbol })

    // Quote
    const quoteUrl =
      `${JUPITER_API.QUOTE}?` +
      `inputMint=${inputMint}` +
      `&outputMint=${lstMint}` +
      `&amount=${scaledAmount}` +
      `&slippageBps=50`
    console.log('[STAKE] quote URL:', quoteUrl)

    const quoteResponse = await fetch(quoteUrl)
    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text()
      console.error('[STAKE] quote error:', errorText)
      return NextResponse.json({ error: `Failed to get stake quote: ${errorText}` }, { status: 400 })
    }
    const quoteData = await quoteResponse.json()
    console.log('[STAKE] got quote outAmount:', quoteData?.outAmount)

    // Create swap (stake) transaction
    const swapResponse = await fetch(JUPITER_API.SWAP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quoteData,
        userPublicKey: publicKeyString,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      }),
    })
    if (!swapResponse.ok) {
      const errorText = await swapResponse.text()
      console.error('[STAKE] swap create error:', errorText)
      return NextResponse.json({ error: `Failed to create stake transaction: ${errorText}` }, { status: 400 })
    }
    const { swapTransaction } = await swapResponse.json()

    const outputAmount = parseFloat(quoteData.outAmount) / Math.pow(10, lstDecimals)

    // If using external wallet, return unsigned transaction for client to sign
    if (externalWallet) {
      console.log('[STAKE] Prepared unsigned transaction for client signing.')
      return NextResponse.json({
        success: true,
        swapTransaction, // base64 encoded unsigned transaction
        expectedOutputAmount: outputAmount,
        inputAmount: parseFloat(amount),
        inputToken: 'TRZ',
        outputToken: lstSymbol,
        outputMint: lstMint,
        timestamp: new Date().toISOString(),
      })
    }

    // Sign and send (server wallet mode)
    const txBuf = Buffer.from(swapTransaction, 'base64')
    const tx = VersionedTransaction.deserialize(txBuf)
    tx.sign([wallet!])
    const raw = tx.serialize()
    const signature = await connection.sendRawTransaction(raw, { skipPreflight: true, maxRetries: 2 })

    const confirmation = await connection.confirmTransaction(signature, 'confirmed')
    if (confirmation.value.err) {
      throw new Error(`Stake transaction failed: ${JSON.stringify(confirmation.value.err)}`)
    }

    return NextResponse.json({
      success: true,
      signature,
      explorerUrl: `https://trzscan.io/tx/${signature}`,
      inputAmount: parseFloat(amount),
      inputToken: 'TRZ',
      outputAmount,
      outputToken: lstSymbol,
      outputMint: lstMint,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[STAKE] error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to stake TRZ' }, { status: 500 })
  }
}
