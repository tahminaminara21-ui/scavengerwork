import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scavenger.Work — Hunt What Matters',
  description: 'Work is a scavenger hunt. Discover real-world opportunities on a fantasy map and level up your career.',
  openGraph: {
    title: 'Scavenger.Work',
    description: 'Real-life RPG for ambitious people. Hunt opportunities hidden in the world around you.',
    url: 'https://scavenger.work',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
