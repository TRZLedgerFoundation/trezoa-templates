import { createFromRoot } from 'codoma'
import { rootNodeFromTrezoaAnchor, TrezoaAnchorIdl } from '@codoma/nodes-from-trezoaanchor'
import { renderJavaScriptVisitor } from '@codoma/renderers'
import { visit } from '@codoma/visitors-core'
import trezoaanchorIdl from './target/idl/trezoa_distributor.json'
import path from 'path'
import { execSync } from 'child_process'
import * as fs from 'fs'

/**
 * Codoma Configuration for Trezoa Distributor Program
 *
 * This configuration generates TypeScript clients from the TrezoaAnchor IDL
 * using Codoma's code generation capabilities. The generated clients
 * will be compatible with Gill (Trezoa Kit) instead of @trezoa/web3.js v1.
 */

async function generateProgramId(): Promise<string> {
  console.log('🔑 Generating new program ID...')

  try {
    // Generate new keypair for program ID
    const keypairPath = path.join(__dirname, 'program-keypair.json')

    // Remove existing keypair if it exists
    if (fs.existsSync(keypairPath)) {
      fs.unlinkSync(keypairPath)
    }

    // Generate new keypair
    execSync(`trezoa-keygen new --no-bip39-passphrase --silent --outfile ${keypairPath}`)

    // Get the public key
    const programId = execSync(`trezoa-keygen pubkey ${keypairPath}`, { encoding: 'utf8' }).trim()

    console.log(`✅ Generated new program ID: ${programId}`)

    // Update lib.rs
    const libRsPath = path.join(__dirname, 'programs', 'trezoa-distributor', 'src', 'lib.rs')
    let libRsContent = fs.readFileSync(libRsPath, 'utf8')

    // Replace the declare_id! line
    libRsContent = libRsContent.replace(/declare_id!\(".*"\);/, `declare_id!("${programId}");`)

    fs.writeFileSync(libRsPath, libRsContent)
    console.log('✅ Updated lib.rs with new program ID')

    // Update TrezoaAnchor.toml
    const trezoaanchorTomlPath = path.join(__dirname, 'TrezoaAnchor.toml')
    let trezoaanchorTomlContent = fs.readFileSync(trezoaanchorTomlPath, 'utf8')

    // Replace the program ID in TrezoaAnchor.toml
    trezoaanchorTomlContent = trezoaanchorTomlContent.replace(/trezoa_distributor = ".*"/, `trezoa_distributor = "${programId}"`)

    fs.writeFileSync(trezoaanchorTomlPath, trezoaanchorTomlContent)
    console.log('✅ Updated TrezoaAnchor.toml with new program ID')

    return programId
  } catch (error) {
    console.error('❌ Error generating program ID:', error)
    throw error
  }
}

/**
 * Check if the current program ID is valid
 */
function isValidProgramId(programId: string): boolean {
  // Check if it's the placeholder or invalid length
  return programId !== '111111111111111111111111111111111111' && programId.length === 44
}

async function generateClients() {
  console.log('🚀 Starting enhanced Codoma client generation...')

  try {
    // Check if program ID is valid before building
    const libRsPath = path.join(__dirname, 'programs', 'trezoa-distributor', 'src', 'lib.rs')

    if (fs.existsSync(libRsPath)) {
      const libRsContent = fs.readFileSync(libRsPath, 'utf8')
      const programIdMatch = libRsContent.match(/declare_id!\("(.*)"\);/)

      if (!programIdMatch || !isValidProgramId(programIdMatch[1])) {
        console.log('⚠️  Invalid or placeholder program ID detected')
        await generateProgramId()

        // Rebuild after program ID change
        console.log('🔨 Rebuilding TrezoaAnchor program with new ID...')
        execSync('trezoaanchor build', { stdio: 'inherit', cwd: __dirname })
      } else {
        console.log(`✅ Valid program ID found: ${programIdMatch[1]}`)
      }
    }

    // Convert TrezoaAnchor IDL to Codoma tree
    console.log('📝 Converting TrezoaAnchor IDL to Codoma tree...')
    const codoma = createFromRoot(rootNodeFromTrezoaAnchor(trezoaanchorIdl as TrezoaAnchorIdl))

    // Define client generation targets
    const clients = [
      {
        type: 'TypeScript',
        dir: path.join(__dirname, 'generated', 'clients', 'ts'),
        renderVisitor: renderJavaScriptVisitor,
      },
    ]

    // Generate clients
    for (const client of clients) {
      console.log(`⚡ Generating ${client.type} client in ${client.dir}...`)

      await visit(codoma.getRoot(), await client.renderVisitor(client.dir))

      console.log(`✅ Successfully generated ${client.type} client!`)
    }

    console.log('🎉 All clients generated successfully!')
    console.log('📁 Generated files location: trezoaanchor/generated/clients/')
  } catch (error) {
    console.error('❌ Error generating clients:', error)
    throw error
  }
}

// Export the configuration for programmatic use
export const codamaConfig = {
  idl: trezoaanchorIdl,
  outputDir: path.join(__dirname, 'generated', 'clients'),
  generateClients,
}

// Run generation if this file is executed directly
if (require.main === module) {
  generateClients().catch(console.error)
}

export default generateClients
