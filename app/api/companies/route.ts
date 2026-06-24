import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const industry   = searchParams.get('industry')
    const stage      = searchParams.get('stage')
    const status     = searchParams.get('status')
    const signalType = searchParams.get('signalType')
    const search     = searchParams.get('search')
    const minScore   = searchParams.get('minScore')
    const maxScore   = searchParams.get('maxScore')
    const sortBy     = searchParams.get('sortBy') ?? 'intentScore'
    const sortDir    = searchParams.get('sortDir') ?? 'desc'
    const page       = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const pageSize   = Math.min(100, parseInt(searchParams.get('pageSize') ?? '50'))

    // Build where clause
    const where: Record<string, unknown> = {}

    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' }
    }

    if (stage) {
      where.stage = stage
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (minScore || maxScore) {
      where.intentScore = {
        ...(minScore ? { gte: parseInt(minScore) } : {}),
        ...(maxScore ? { lte: parseInt(maxScore) } : {}),
      }
    }

    if (signalType) {
      where.signals = {
        some: { type: signalType },
      }
    }

    // Validate sort field
    const allowedSortFields = ['intentScore', 'createdAt', 'name']
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'intentScore'
    const orderByDir = sortDir === 'asc' ? 'asc' : 'desc'

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: { signals: { orderBy: { detectedAt: 'desc' } } },
        orderBy: { [orderByField]: orderByDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.company.count({ where }),
    ])

    return NextResponse.json({
      companies,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[GET /api/companies] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}
