import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const companyCount = await prisma.company.count()
    const signalCount = await prisma.signal.count()
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      companies: companyCount,
      signals: signalCount,
    })
  } catch (error) {
    console.error('DB health check failed:', error)
    return NextResponse.json(
      { status: 'error', database: 'disconnected', error: String(error) },
      { status: 500 }
    )
  }
}
