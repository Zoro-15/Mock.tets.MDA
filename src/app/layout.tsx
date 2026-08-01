import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  title: 'NDA Mock Test Platform',
  description: 'A modern, responsive mock test platform for NDA aspirants.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased min-h-screen bg-background-custom text-text-primary-custom selection:bg-primary-custom/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
