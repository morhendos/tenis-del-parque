import { useState, useEffect } from 'react'

export default function useLeaguesData() {
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLeagues = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/leagues', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch leagues')
      
      const data = await res.json()
      setLeagues(data.leagues || [])
    } catch (error) {
      console.error('Error fetching leagues:', error)
      setError('Error loading leagues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeagues()
  }, [])

  const handleImportCSV = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/leagues/import', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        fetchLeagues() // Refresh leagues list
        return {
          success: true,
          message: data.message,
          created: data.created,
          updated: data.updated,
          errors: data.errors
        }
      } else {
        return {
          success: false,
          message: data.error || 'Import failed',
          errors: data.errors
        }
      }
    } catch (error) {
      console.error('Error importing leagues:', error)
      return {
        success: false,
        message: 'Error importing leagues',
        errors: []
      }
    }
  }

  const exportCSV = () => {
    window.location.href = '/api/admin/leagues/export'
  }

  return {
    leagues,
    loading,
    error,
    handleImportCSV,
    exportCSV,
    refetch: fetchLeagues,
    refreshLeagues: fetchLeagues // Add this alias for compatibility
  }
}