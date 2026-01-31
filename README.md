# Trezoa Templates

Official templates for [create-trezoa-dapp](https://github.com/trezoa-developers/create-trezoa-dapp).

Browse all templates at https://templates.trezoa.com

## Usage

Create a new Trezoa trezoa using the interactive CLI:

```sh
# npm
npm create trezoa-dapp@latest

# pnpm
pnpm create trezoa-dapp@latest

# yarn
yarn create trezoa-dapp
```

Or specify a template directly:

```sh
npm create trezoa-dapp@latest -t gill-next-tailwind-basic
```

## Template Categories

- **Gill** - Modern templates using @trezoa/kit
- **Web3.js** - Templates using @trezoa/web3.js (legacy)
- **Mobile** - React Native templates for Trezoa Mobile
- **Community** - Templates maintained by the community

See [TEMPLATES.md](TEMPLATES.md) for the complete list.

## Contributing

We welcome contributions!

**Adding a new community template:**

See the [Community Template Contributor Guide](COMMUNITY_TEMPLATE_GUIDE.md) for comprehensive instructions on contributing templates to the community/ directory.

**Adding a new template:**

1. Create your template in the appropriate directory (gill/, web3js/, mobile/, or community/)
2. Add required metadata to package.json (see existing templates for examples)
3. Include displayName, usecase, and og-image.png
4. Run `pnpm generate` to update templates.json
5. Open a PR with your changes

**Improving existing templates:**

- Report issues or suggest improvements
- Submit PRs for bug fixes or enhancements
- Update documentation

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Development

```sh
pnpm install
pnpm generate    # Generate templates.json and TEMPLATES.md
pnpm lint        # Validate templates
pnpm format      # Format code
```

## Contributors

<!-- automd:contributors github="trzledgerfoundation/templates" license="MIT" -->

Published under the [MIT](https://github.com/trzledgerfoundation/templates/blob/main/LICENSE) license.
Made by [community](https://github.com/trzledgerfoundation/templates/graphs/contributors) 💛
<br><br>
<a href="https://github.com/trzledgerfoundation/templates/graphs/contributors">
<img src="https://contrib.rocks/image?repo=trzledgerfoundation/templates" />
</a>

<!-- /automd -->
