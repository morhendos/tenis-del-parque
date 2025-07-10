import dbConnect from '../../../../../lib/db/mongoose'
import User from '../../../../../lib/models/User'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    await dbConnect()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    
    // Build query
    const query = {}
    if (role) query.role = role
    if (status) {
      if (status === 'active') {
        query.isActive = true
        query.emailVerified = true
      } else if (status === 'inactive') {
        query.isActive = false
      } else if (status === 'unverified') {
        query.emailVerified = false
      }
    }

    // Fetch users with player info
    const users = await User
      .find(query)
      .populate('playerId', 'name whatsapp level league status')
      .sort({ createdAt: -1 })
      .lean()

    // Create CSV content
    const headers = [
      'Email',
      'Role',
      'Status',
      'Email Verified',
      'Created Date',
      'Last Login',
      'Language Preference',
      'Player Name',
      'Player WhatsApp',
      'Player Level',
      'Player Status'
    ]
    
    const rows = users.map(user => {
      const player = user.playerId || {}
      let userStatus = 'Active'
      if (!user.isActive) userStatus = 'Inactive'
      else if (!user.emailVerified) userStatus = 'Unverified'
      
      return [
        user.email,
        user.role,
        userStatus,
        user.emailVerified ? 'Yes' : 'No',
        new Date(user.createdAt).toISOString().split('T')[0],
        user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : 'Never',
        user.preferences?.language || 'es',
        player.name || '',
        player.whatsapp || '',
        player.level || '',
        player.status || ''
      ]
    })

    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to export users' 
      },
      { status: 500 }
    )
  }
}