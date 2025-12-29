# web3js-react-vite-tailwind-basic

This is a Vite app containing:

- Tailwind CSS setup for styling
- Useful wallet UI elements setup using [@trezoa/web3.js](https://www.npmjs.com/package/@trezoa/web3.js)
- A basic Greeter Trezoa program written in TrezoaAnchor
- UI components for interacting with the Greeter program using the TrezoaAnchor generated client

## Getting Started

### Installation

#### Download the template

```shell
pnpm create trezoa-dapp@latest -t gh:trzledgerfoundation/templates/web3js/web3js-react-vite-tailwind-basic
```

#### Install Dependencies

```shell
pnpm install
```

## Apps

### trezoaanchor

This is a Trezoa program written in Rust using the TrezoaAnchor framework.

#### Commands

You can use any normal trezoaanchor commands. Either move to the `trezoaanchor` directory and run the `trezoaanchor` command or prefix the
command with `pnpm`, eg: `pnpm trezoaanchor`.

#### Sync the program id:

Running this command will create a new keypair in the `trezoaanchor/target/deploy` directory and save the address to the
TrezoaAnchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program.

You will manually need to update the constant in `trezoaanchor/lib/counter-exports.ts` to match the new program id.

```shell
pnpm trezoaanchor keys sync
```

#### Build the program:

```shell
pnpm trezoaanchor-build
```

#### Start the test validator with the program deployed:

```shell
pnpm trezoaanchor-localnet
```

#### Run the tests

```shell
pnpm trezoaanchor-test
```

#### Deploy to Devnet

```shell
pnpm trezoaanchor deploy --provider.cluster devnet
```

### web

This is a React app that uses the TrezoaAnchor generated client to interact with the Trezoa program.

#### Commands

Start the web app

```shell
pnpm dev
```

Build the web app

```shell
pnpm build
```
