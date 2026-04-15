import './globals.css'; // Global styles

export const metadata = {
  title: 'AbonoShare',
  description: 'High-trust bill splitting with mandatory receipt verification and settlement history.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
