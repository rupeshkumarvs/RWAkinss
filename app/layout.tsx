// Built by vsrupeshkumar
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { WalletProvider } from '@/context/WalletContext'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RWAkins — An AI CFO for Real-World Asset Portfolios',
  description:
    'Autonomous, multi-agent rebalancing of tokenized RWAs (USDY + mETH) on Mantle. Describe your goals in plain English; a transparent AI council debates, votes, and executes every rebalance on-chain.',
}

// Minimal root shell for the RWAkins agent app. Each screen renders its own
// AgentNav / navbar, so the layout only needs the wallet context + toaster.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Luxury hero fonts — Clash Display + Satoshi (Fontshare), Fira Code (Google) */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap" />
        {/* Restore saved theme before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.setAttribute('data-theme',localStorage.getItem('rwakins-theme')||'light')}catch(e){}` }} />
      </head>
      <body style={{ fontFamily: "'Satoshi', var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif", background: '#080808' }}>
        <WalletProvider>{children}</WalletProvider>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#111',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontFamily: 'var(--font-jakarta), sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}
