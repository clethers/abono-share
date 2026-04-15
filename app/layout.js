import './globals.css'; // Global styles

export const metadata = {
  title: 'AbonoShare',
  description: 'High-trust bill splitting with mandatory receipt verification and settlement history.',
};

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
