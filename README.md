This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)

## Getting Started

First, run the development server:

export API_BASE_URL=http://localhost:10000 --> Gateway URL
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## NOTE
Before creating PR, always run npm run build locally to see if build is successful

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Quick: rewrites for local vs remote backends

If you want a minimal copy/paste reference for `rewrites()` behavior, use one of the two options below.

- All-local (everything routed to a local gateway on port `10000`):

```js
async rewrites() {
    const apiDestination = process.env.API_BASE_URL || 'http://localhost:10000';
	return [
		{
			source: '/api/:path*',
			destination: `${apiDestination}/api/:path*`,
		},
	];
}
```

- Remote backend (auth still routed locally, all other APIs to `API_BASE_URL`):

```js
async rewrites() {
	const apiDestination = process.env.API_BASE_URL || 'https://dev.app.argusintelligence.net';

	return [
		// AUTH → local gateway
		{
			source: '/api/auth/:path*',
			destination: 'http://localhost:10000/api/auth/:path*',
		},
		// Everything else → remote backend
		{
			source: '/api/:path*',
			destination: `${apiDestination}/api/:path*`,
		},
	];

}
```

Examples for running the dev server:

```bash
# use local backend
API_BASE_URL=http://localhost:10000 npm run dev

# use remote backend (auth still local)
API_BASE_URL=https://dev.app.argusintelligence.net npm run dev
```

Note: `next.config` reads `process.env.API_BASE_URL` at dev/build start; restart the server after changing the variable.
