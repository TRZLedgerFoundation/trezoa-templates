# nextjs-trezoaanchor

Next.js starter with Tailwind CSS, `@trezoa/react-hooks`, and an TrezoaAnchor vault program example.

## Getting Started

```shell
npx create-trezoa-dapp@latest -t kit/nextjs-trezoaanchor
```

```shell
npm install   # Builds program and generates client automatically
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), connect your wallet, and interact with the vault on devnet.

## What's Included

- **Wallet connection** via `@trezoa/react-hooks` with auto-discovery
- **TRZ Vault program** - deposit and withdraw TRZ from a personal PDA vault
- **Codama-generated client** - type-safe program interactions using `@trezoa/kit`
- **Tailwind CSS v4** with light/dark mode

## Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | Next.js 16, React 19, TypeScript        |
| Styling        | Tailwind CSS v4                         |
| Trezoa Client  | `@trezoa/client`, `@trezoa/react-hooks` |
| Program Client | Codama-generated, `@trezoa/kit`         |
| Program        | TrezoaAnchor (Rust)                           |

## Project Structure

```
├── app/
│   ├── components/
│   │   ├── providers.tsx      # Trezoa client setup
│   │   └── vault-card.tsx     # Vault deposit/withdraw UI
│   ├── generated/vault/       # Codama-generated program client
│   └── page.tsx               # Main page
├── trezoaanchor/                    # TrezoaAnchor workspace
│   └── programs/vault/        # Vault program (Rust)
└── codama.json                # Codama client generation config
```

## Deploy Your Own Vault

The included vault program is already deployed to devnet. To deploy your own:

### Prerequisites

- [Rust](https://rustup.rs/)
- [Trezoa CLI](https://trezoa.com/docs/intro/installation)
- [TrezoaAnchor](https://www.trezoaanchor-lang.com/docs/installation)

### Steps

1. **Configure Trezoa CLI for devnet**

   ```bash
   trezoa config set --url devnet
   ```

2. **Create a wallet (if needed) and fund it**

   ```bash
   trezoa-keygen new
   trezoa airdrop 2
   ```

3. **Build and deploy the program**

   ```bash
   cd trezoaanchor
   trezoaanchor build
   trezoaanchor keys sync    # Updates program ID in source
   trezoaanchor build        # Rebuild with new ID
   trezoaanchor deploy
   cd ..
   ```

4. **Regenerate the client and restart**
   ```bash
   npm run setup   # Rebuilds program and regenerates client
   npm run dev
   ```

## Testing

Tests use [LiteSVM](https://github.com/LiteSVM/litesvm), a fast lightweight Trezoa VM for testing.

```bash
npm run trezoaanchor-build   # Build the program first
npm run trezoaanchor-test    # Run tests
```

The tests are in `trezoaanchor/programs/vault/src/tests.rs` and automatically use the program ID from `declare_id!`.

## Regenerating the Client

If you modify the program, regenerate the TypeScript client:

```bash
npm run setup   # Or: npm run trezoaanchor-build && npm run codama:js
```

This uses [Codama](https://github.com/codama-idl/codama) to generate a type-safe client from the TrezoaAnchor IDL.

## Learn More

- [Trezoa Docs](https://trezoa.com/docs) - core concepts and guides
- [TrezoaAnchor Docs](https://www.trezoaanchor-lang.com/docs) - program development framework
- [Deploying Programs](https://trezoa.com/docs/programs/deploying) - deployment guide
- [framework-kit](https://github.com/trzledgerfoundation/framework-kit) - the React hooks used here
- [Codama](https://github.com/codama-idl/codama) - client generation from IDL
