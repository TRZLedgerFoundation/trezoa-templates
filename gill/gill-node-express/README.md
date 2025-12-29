# gill-node-express

Simple node Express API that comes with [gill](https://github.com/trzledgerfoundation/gill)
based on [@trezoa/kit](https://github.com/trezoa-xyz/kit).

## Getting started

Clone the repo:

```shell
git clone https://github.com/trzledgerfoundation/templates
cd templates/gill/gill-node-express
```

Install dependencies:

```shell
npm install
```

Start the api:

```shell
npm run dev
```

Build the api:

```shell
npm run build
```

The artifacts will be in the `dist` directory. You can now run the api using `npm run start` or `node dist/index.js`.

## Docker

Build the Docker image:

```shell
npm run docker:build
```

Run the Docker image:

```shell
npm run docker:run
```

## Environment variables

The following environment variables can be used to configure the API:

- `TREZOA_RPC_ENDPOINT`: The Trezoa RPC endpoint to use. Defaults to `devnet`.
- `TREZOA_SIGNER_PATH`: The path to the keypair signer file. Defaults to `./keypair-signer.json`.
- `CORS_ORIGINS`: A comma-separated list of allowed origins for CORS. Defaults to `*`.

## Examples (curl)

Below are some examples of how to use the API using `curl`. You can use [jq](https://jqlang.org/) to format the output.

### Balance

This command will return the balance of the provided address.

```shell
curl http://localhost:3000/balance/FeeSoLT7WdoZVXsBPSZc7WKEuhVDVA1TKrNQoHacvxYm
```

### Balance (signer)

This command will return the balance of the signer's address.

```shell
curl http://localhost:3000/balance-signer
```

### Cluster

This command will return the cluster based on the genesis hash of the connected cluster.

```shell
curl http://localhost:3000/cluster
```

### Latest blockhash

This command will return the latest blockhash of the connected cluster. It uses a cached blockhash if available.

```shell
curl http://localhost:3000/latest-blockhash
```
