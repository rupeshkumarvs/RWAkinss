import { NextResponse } from 'next/server';
import { Keypair } from '@solana/web3.js';
import { solanaService } from '@/server/services/solana.service';

export async function GET() {
  try {
    const authoritySecret = JSON.parse(process.env.PUSD_AUTHORITY_KEY!);
    const authority = Keypair.fromSecretKey(Uint8Array.from(authoritySecret));
    const treasuryAddress = authority.publicKey.toBase58();
    const portfolio = await solanaService.getPortfolio(treasuryAddress);

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Portfolio API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}
