// Quick admin utility to manually clear cache for a club
// Usage: Add this as a button in the clubs list

export async function clearClubCache(city, slug) {
  try {
    const response = await fetch('/api/revalidate', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, slug })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to clear cache')
    }

    return data
  } catch (error) {
    console.error('Error clearing cache:', error)
    throw error
  }
}

export async function clearPageCache(path) {
  try {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to clear cache')
    }

    return data
  } catch (error) {
    console.error('Error clearing cache:', error)
    throw error
  }
}
