import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BLAQMART - Local Commerce for Warrenton',
  description: 'Fast delivery from your favorite local vendors in Warrenton',
  keywords: ['delivery', 'warrenton', 'local', 'shopping', 'groceries'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
