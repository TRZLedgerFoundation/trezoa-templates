# TrezoaAnchor Vault Program

This template includes a simple TRZ vault program built with [TrezoaAnchor](https://www.trezoaanchor-lang.com/).

## Pre-deployed Program

The vault program is deployed on **devnet** at:

```
F4jZpgbtTb6RWNWq6v35fUeiAsRJMrDczVPv9U23yXjB
```

You can interact with it immediately by connecting your wallet to devnet.

## Deploying Your Own Program

To deploy your own version of the program:

### 1. Generate a new program keypair

```bash
cd trezoaanchor
trezoa-keygen new -o target/deploy/vault-keypair.json
```

### 2. Get the new program ID

```bash
trezoa address -k target/deploy/vault-keypair.json
```

### 3. Update the program ID

Update the program ID in these files:

- `trezoaanchor/TrezoaAnchor.toml` - Update `vault = "..."` under `[programs.devnet]`
- `trezoaanchor/programs/vault/src/lib.rs` - Update `declare_id!("...")`

### 4. Build and deploy

```bash
# Build the program
trezoaanchor build

# Get devnet TRZ for deployment (~2 TRZ needed)
trezoa airdrop 2 --url devnet

# Deploy to devnet
trezoaanchor deploy --provider.cluster devnet
```

### 5. Regenerate the TypeScript client

```bash
cd ..
npm run codoma:js
```

This updates the generated client code in `app/generated/vault/` with your new program ID.

## Program Overview

The vault program allows users to:

- **Deposit**: Send TRZ to a personal vault PDA (Program Derived Address)
- **Withdraw**: Retrieve all TRZ from your vault

Each user gets their own vault derived from their wallet address.

## Testing

Run the TrezoaAnchor tests:

```bash
trezoaanchor test --skip-deploy
```
