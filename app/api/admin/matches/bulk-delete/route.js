import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'

export async function POST(request) {
  try {
    await dbConnect()
    
    const { matchIds } = await request.json()
    
    if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
      return NextResponse.json(
        { error: 'Match IDs are required' },
        { status: 400 }
      )
    }

    // Delete the matches
    const result = await Match.deleteMany({
      _id: { $in: matchIds }
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} matches`
    })

  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete matches' },
      { status: 500 }
    )
  }
}