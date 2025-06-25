# Liga de Tenis del Parque - Sotogrande

Landing page for the amateur tennis league in Sotogrande, Spain.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Modern, responsive design
- Lead capture form (name and email)
- Smooth animations and transitions
- Custom branding with tennis ball and flame logo
- Tailwind CSS for styling
- Next.js 14 with App Router

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Customization

### Colors

The brand colors are defined in `tailwind.config.js`:
- Purple: `#563380`
- Green: `#8FBF60`
- Yellow: `#E6E94E`
- Background: `#D5D3C3`

### Form Submission

Currently, the form logs submissions to the console. To connect it to a backend:

1. Replace the `handleSubmit` function in `app/page.js`
2. Send data to your API endpoint
3. Handle the response accordingly

## License

All rights reserved - Liga de Tenis del Parque 2025