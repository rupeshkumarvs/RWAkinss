import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Connection, clusterApiUrl } from '@solana/web3.js';

export async function GET() {
  try {
    // 1. Check Database (Prisma)
    await prisma.$queryRaw`SELECT 1`;
    const dbStatus = 'connected';

    // 2. Check Blockchain (Solana)
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const version = await connection.getVersion();
    const solanaStatus = `connected (v${version['solana-core']})`;

    // 3. Check AI (OpenAI)
    const aiStatus = process.env.OPENAI_API_KEY ? 'configured' : 'missing';

    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        blockchain: solanaStatus,
        ai: aiStatus,
        network: 'devnet'
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'degraded',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
