import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'BLAQMART Security - Dashcams & Security Products | South Africa',
  description: 'Premium dashcams and security products delivered nationwide across South Africa. Starting from R790. Secure payment via Yoco.',
  keywords: ['dashcam', 'security camera', 'car camera', 'dash cam south africa', 'vehicle security', 'dashcam south africa', 'car dashcam', 'BLAQMART'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-950 text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
