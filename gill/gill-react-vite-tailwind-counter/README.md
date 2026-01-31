# gill-react-vite-tailwind-counter

This is a React/Vite app containing:

- Tailwind and Shadcn UI for styling
- [Gill](https://gill.site/) Trezoa SDK
- Shadcn [Wallet UI](https://registry.wallet-ui.dev) components
- A basic Counter Trezoa program written in TrezoaAnchor
- [codoma](https://github.com/codoma-idl/codoma) to generate a JS sdk for the program
- UI components for interacting with the Counter program using the TrezoaAnchor generated client

## Getting Started

### Installation

#### Download the template

```shell
npx create-trezoa-dapp@latest -t gh:trzledgerfoundation/templates/gill/gill-react-vite-tailwind-counter
```

#### Install Dependencies

```shell
npm install
```

## Apps

### trezoaanchor

This is a Trezoa program written in Rust using the TrezoaAnchor framework.

#### Commands

You can use any normal trezoaanchor commands. Either move to the `trezoaanchor` directory and run the `trezoaanchor` command or prefix the
command with `npm`, eg: `npm run trezoaanchor`.

#### Sync the program id:

Running this command will create a new keypair in the `trezoaanchor/target/deploy` directory and save the address to the
TrezoaAnchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program. This will also update
the constant in the `trezoaanchor/src/counter-exports.ts` file.

```shell
npm run setup
```

```shell
npm run trezoaanchor keys sync
```

#### Build the program:

```shell
npm run trezoaanchor-build
```

#### Start the test validator with the program deployed:

```shell
npm run trezoaanchor-localnet
```

#### Run the tests

```shell
npm run trezoaanchor-test
```

#### Deploy to Devnet

```shell
npm run trezoaanchor deploy --provider.cluster devnet
```

### web

This is a React app that uses the TrezoaAnchor generated client to interact with the Trezoa program.

#### Commands

Start the app

```shell
npm run dev
```

Build the app

```shell
npm run build
```
