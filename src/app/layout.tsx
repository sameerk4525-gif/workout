import type { Metadata, Viewport } from 'next';
import './globals.css';
import Shell from '@/components/layout/Shell';

export const metadata: Metadata = {
  title: 'IronQuest — Gamified Workout Tracker',
  description: 'Track your strength progress, log workouts, beat personal records, level up your XP, and share your fitness journey on the social feed.',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'IronQuest — Gamified Workout Tracker',
    description: 'Track your strength progress, log workouts, beat personal records, level up your XP, and share your fitness journey on the social feed.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-blue-500/30 selection:text-blue-200">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
