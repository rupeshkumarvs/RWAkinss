// Built by vsrupeshkumar
import type { Metadata } from 'next'
import TreasuryNav from './_components/TreasuryNav'

const title = 'AI RWA Treasury — RWAkins'
const description = 'Autonomous AI treasury rebalancing USDY and mETH with on-chain risk guardrails on Mantle'
const url = 'https://kubryx.vercel.app/treasury'

export const metadata: Metadata = {
  metadataBase: new URL('https://kubryx.vercel.app'),
  title, description,
  openGraph: { title, description, url, siteName:'RWAkins', type:'website', images:[{ url:'/og-default.svg', width:1200, height:630 }] },
  twitter: { card:'summary_large_image', title, description, images:['/og-default.svg'] },
}

export default function TreasuryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background:'#ffffff', minHeight:'100vh', color: '#0A0F2E', fontFamily:'"Inter",system-ui,sans-serif' }}>
      <TreasuryNav />
      {children}
    </div>
  )
}
