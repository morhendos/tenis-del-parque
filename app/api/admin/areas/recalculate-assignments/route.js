import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { recalculateAllClubAssignments } from '@/lib/utils/clubAssignmentCache'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Admin triggered club assignment recalculation')
    
    const result = await recalculateAllClubAssignments()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully recalculated assignments for ${result.totalClubs} clubs`,
        stats: {
          total: result.totalClubs,
          updated: result.updated,
          unchanged: result.unchanged,
          duration: result.duration
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error in recalculate assignments API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
