import { execSync } from 'child_process'
import * as fs from 'fs'
import type { GillDeploymentResult } from './types'

import { address, type Address } from 'gill'

export interface GillBuildConfig {
  workingDir?: string
  network?: 'devnet' | 'mainnet' | 'testnet'
  verbose?: boolean
}

interface BuildState {
  lastBuildHash: string | null
  lastDeployHash: string | null
}

const buildState: BuildState = {
  lastBuildHash: null,
  lastDeployHash: null,
}

export function getGillSourceHash(config: GillBuildConfig = {}): string {
  const { workingDir = '.' } = config

  try {
    const libPath = `${workingDir}/programs/trezoa-distributor/src/lib.rs`
    const cargoPath = `${workingDir}/programs/trezoa-distributor/Cargo.toml`
    const trezoaanchorPath = `${workingDir}/TrezoaAnchor.toml`

    const sources = [
      fs.existsSync(libPath) ? fs.readFileSync(libPath, 'utf8') : '',
      fs.existsSync(cargoPath) ? fs.readFileSync(cargoPath, 'utf8') : '',
      fs.existsSync(trezoaanchorPath) ? fs.readFileSync(trezoaanchorPath, 'utf8') : '',
    ].join('')

    return Buffer.from(sources).toString('base64')
  } catch {
    return Date.now().toString()
  }
}

export function checkGillProgramIdConsistency(config: GillBuildConfig = {}): {
  consistent: boolean
  declaredId: string | null
  deployedId: string | null
  trezoaanchorId: string | null
} {
  const declaredId = getGillDeclaredProgramId(config)
  const deployedId = getGillDeployedProgramId(config)
  const trezoaanchorId = getGillTrezoaAnchorProgramId(config)

  const consistent = declaredId && deployedId && trezoaanchorId && declaredId === deployedId && declaredId === trezoaanchorId

  return { consistent: !!consistent, declaredId, deployedId, trezoaanchorId }
}

export function getGillDeclaredProgramId(config: GillBuildConfig = {}): string | null {
  const { workingDir = '.' } = config

  try {
    const libContent = fs.readFileSync(`${workingDir}/programs/trezoa-distributor/src/lib.rs`, 'utf8')
    const match = libContent.match(/declare_id!\("([^"]+)"\);/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export function getGillDeployedProgramId(config: GillBuildConfig = {}): string | null {
  const { workingDir = '.' } = config

  try {
    const output = execSync(`trezoa address -k ${workingDir}/target/deploy/trezoa_distributor-keypair.json`, {
      encoding: 'utf8',
    })
    return output.trim()
  } catch {
    return null
  }
}

export function getGillTrezoaAnchorProgramId(config: GillBuildConfig = {}): string | null {
  const { workingDir = '.' } = config

  try {
    const trezoaanchorContent = fs.readFileSync(`${workingDir}/TrezoaAnchor.toml`, 'utf8')
    const match = trezoaanchorContent.match(/trezoa_distributor = "([^"]+)"/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export async function buildGillProgramIfNeeded(
  force: boolean = false,
  config: GillBuildConfig = {},
): Promise<GillDeploymentResult> {
  const { workingDir = '.', verbose = false } = config

  try {
    const currentHash = getGillSourceHash(config)

    if (!force && buildState.lastBuildHash === currentHash) {
      console.log('✅ Build is up to date, skipping... (Gill)')
      const programId = getGillDeclaredProgramId(config)
      return { success: true, programId: programId ? address(programId) : undefined }
    }

    console.log('🔨 Building program with Gill...')
    execSync('trezoaanchor build', {
      stdio: verbose ? 'inherit' : 'pipe',
      cwd: workingDir,
    })

    buildState.lastBuildHash = currentHash
    const programId = getGillDeclaredProgramId(config)

    console.log('✅ Build completed successfully! (Gill)')
    return { success: true, programId: programId ? address(programId) : undefined }
  } catch (error) {
    console.error('❌ Build failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function deployGillProgram(
  programKeypairPath?: string,
  config: GillBuildConfig = {},
): Promise<GillDeploymentResult> {
  const { workingDir = '.', verbose = false } = config

  try {
    const buildResult = await buildGillProgramIfNeeded(false, config)
    if (!buildResult.success) {
      return {
        success: false,
        error: 'Build failed before deployment',
        programId: buildResult.programId,
      }
    }

    if (programKeypairPath) {
      console.log('📋 Setting up program keypair... (Gill)')
      execSync(`mkdir -p ${workingDir}/target/deploy`)
      execSync(`cp ${programKeypairPath} ${workingDir}/target/deploy/trezoa_distributor-keypair.json`)
      console.log('✅ Program keypair configured (Gill)')
    }

    console.log('📡 Deploying program with Gill...')
    const deployOutput = execSync('trezoaanchor deploy', {
      stdio: verbose ? 'inherit' : 'pipe',
      cwd: workingDir,
      encoding: 'utf8',
    })

    const programIdMatch = deployOutput.match(/Program Id: (\w+)/)
    const programIdStr = programIdMatch ? programIdMatch[1] : getGillDeployedProgramId(config)

    console.log('✅ Program deployed successfully! (Gill)')

    buildState.lastDeployHash = getGillSourceHash(config)

    return {
      success: true,
      programId: programIdStr ? address(programIdStr) : undefined,
    }
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function ensureGillProgramIdConsistency(
  targetProgramId?: string | Address,
  config: GillBuildConfig = {},
): Promise<boolean> {
  const { workingDir = '.' } = config

  const consistency = checkGillProgramIdConsistency(config)

  const targetProgramIdStr = targetProgramId
    ? typeof targetProgramId === 'string'
      ? targetProgramId
      : targetProgramId
    : undefined

  if (consistency.consistent && !targetProgramIdStr) {
    console.log('✅ Program ID consistency verified! (Gill)')
    return true
  }

  const newProgramId = targetProgramIdStr || consistency.deployedId || consistency.declaredId || consistency.trezoaanchorId
  if (!newProgramId) {
    console.error('❌ No valid program ID found to ensure consistency')
    return false
  }

  if (consistency.consistent && targetProgramIdStr && consistency.declaredId === targetProgramIdStr) {
    console.log('✅ Program ID already matches target! (Gill)')
    return true
  }

  console.log('🔧 Updating program ID references... (Gill)')

  try {
    const libPath = `${workingDir}/programs/trezoa-distributor/src/lib.rs`
    let libContent = fs.readFileSync(libPath, 'utf8')
    libContent = libContent.replace(/declare_id!\(".*"\);/, `declare_id!("${newProgramId}");`)
    fs.writeFileSync(libPath, libContent)
    console.log('   ✅ Updated lib.rs')
  } catch (error) {
    console.error('   ❌ Failed to update lib.rs:', error)
    return false
  }

  try {
    const trezoaanchorPath = `${workingDir}/TrezoaAnchor.toml`
    let trezoaanchorContent = fs.readFileSync(trezoaanchorPath, 'utf8')
    trezoaanchorContent = trezoaanchorContent.replace(/trezoa_distributor = ".*"/, `trezoa_distributor = "${newProgramId}"`)
    fs.writeFileSync(trezoaanchorPath, trezoaanchorContent)
    console.log('   ✅ Updated TrezoaAnchor.toml')
  } catch (error) {
    console.error('   ❌ Failed to update TrezoaAnchor.toml:', error)
    return false
  }

  console.log('🔄 Rebuilding with updated program ID... (Gill)')
  const buildResult = await buildGillProgramIfNeeded(true, config)

  if (!buildResult.success) {
    console.error('❌ Failed to rebuild after program ID update')
    return false
  }

  console.log('✅ Program ID consistency ensured! (Gill)')
  return true
}

export async function cleanGillBuildArtifacts(config: GillBuildConfig = {}): Promise<void> {
  const { workingDir = '.', verbose = false } = config

  try {
    console.log('🧹 Cleaning build artifacts... (Gill)')
    execSync('trezoaanchor clean', {
      stdio: verbose ? 'inherit' : 'pipe',
      cwd: workingDir,
    })
    buildState.lastBuildHash = null
    buildState.lastDeployHash = null
    console.log('✅ Clean completed! (Gill)')
  } catch (error) {
    console.error('❌ Clean failed:', error)
    throw error
  }
}

export function getGillProgramStatus(config: GillBuildConfig = {}): {
  built: boolean
  deployed: boolean
  consistent: boolean
  programId: string | null
} {
  const { workingDir = '.' } = config

  const consistency = checkGillProgramIdConsistency(config)
  const targetExists = fs.existsSync(`${workingDir}/target/deploy/trezoa_distributor-keypair.json`)
  const idlExists = fs.existsSync(`${workingDir}/target/idl/trezoa_distributor.json`)

  return {
    built: targetExists && idlExists,
    deployed: !!consistency.deployedId,
    consistent: consistency.consistent,
    programId: consistency.declaredId,
  }
}
