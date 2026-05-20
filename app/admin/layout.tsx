import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import '../globals.css';

const pjs = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-pjs',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-fraunces',
});

export const metadata: Metadata = {
  title: 'Viviendas Virtuo · Admin',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${pjs.variable} ${fraunces.variable}`}
        style={{
          fontFamily: "var(--font-pjs, 'Plus Jakarta Sans'), sans-serif",
          background: '#F0F4FF',
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
