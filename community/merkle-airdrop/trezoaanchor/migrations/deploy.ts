// Modern Gill-based deployment migration
// This replaces the legacy TrezoaAnchor provider approach with Gill + Codoma

import { runGillDeploymentSetup } from '../scripts/deploy-setup'

/**
 * Gill-based migration that deploys the program using modern Trezoa tooling
 * This is called by `trezoaanchor deploy` and uses our Gill deployment pipeline
 */
export default async function (_provider?: any) {
  console.log('🚀 Running Gill-based deployment migration...\n')

  try {
    // Use our existing Gill deployment setup
    await runGillDeploymentSetup()

    console.log('✅ Gill-based deployment completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// For TrezoaAnchor compatibility (TrezoaAnchor expects module.exports)
module.exports = exports.default
