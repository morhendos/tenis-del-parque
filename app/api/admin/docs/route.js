import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('file')

    // If fileName is provided, return the content of that file
    if (fileName) {
      const filePath = path.join(process.cwd(), 'docs', fileName)
      
      // Security check - ensure the path is within the docs directory
      if (!filePath.startsWith(path.join(process.cwd(), 'docs'))) {
        return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
      }

      try {
        const content = await fs.readFile(filePath, 'utf-8')
        return NextResponse.json({
          fileName,
          content,
          path: filePath
        })
      } catch (error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
    }

    // Otherwise, list all markdown files in the docs directory
    const docsPath = path.join(process.cwd(), 'docs')
    
    try {
      const files = await fs.readdir(docsPath)
      const markdownFiles = files
        .filter(file => file.endsWith('.md'))
        .sort()

      // Get file stats and first few lines of content for each file
      const filesWithDetails = await Promise.all(
        markdownFiles.map(async (file) => {
          const filePath = path.join(docsPath, file)
          const stats = await fs.stat(filePath)
          const content = await fs.readFile(filePath, 'utf-8')
          
          // Extract title (first # heading) and description (first paragraph)
          const lines = content.split('\n')
          let title = file.replace('.md', '')
          let description = ''
          
          for (const line of lines) {
            if (line.startsWith('# ') && !title) {
              title = line.replace('# ', '').trim()
            } else if (line.trim() && !line.startsWith('#') && !description) {
              description = line.trim()
              if (description.length > 150) {
                description = description.substring(0, 150) + '...'
              }
              break
            }
          }

          return {
            name: file,
            title,
            description,
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime
          }
        })
      )

      return NextResponse.json({
        files: filesWithDetails,
        count: filesWithDetails.length
      })
    } catch (error) {
      console.error('Error reading docs directory:', error)
      return NextResponse.json({ error: 'Failed to read docs directory' }, { status: 500 })
    }
  } catch (error) {
    console.error('Docs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
