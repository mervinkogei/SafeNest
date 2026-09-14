import './globals.css';
import { ReactNode } from 'react';
import SiteHeader from '@/components/SiteHeader';
import AiGuide from '@/components/AiGuide';

export const metadata = {
  title: 'SafeNest',
  description: 'Protect. Understand. Act. Learn about online safety, then record an incident with a trusted adult.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Source+Sans+3:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteHeader />
        {children}
        <AiGuide />
      </body>
    </html>
  );
}
