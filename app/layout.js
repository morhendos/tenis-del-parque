export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://tenisdelparque.com'),
}

export default function RootLayout({ children }) {
  return children;
}