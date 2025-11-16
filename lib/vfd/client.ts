// VFD BaaS API client utility functions

export async function generateVFDToken() {
  try {
    const credentials = `${process.env.VFD_CONSUMER_KEY}:${process.env.VFD_CONSUMER_SECRET}`
    const base64Credentials = Buffer.from(credentials).toString('base64')
    
    const response = await fetch(`${process.env.VFD_BASE_URL}/baasauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${base64Credentials}`,
      },
      body: JSON.stringify({
        consumerKey: process.env.VFD_CONSUMER_KEY,
        consumerSecret: process.env.VFD_CONSUMER_SECRET,
        validityTime: -1 // Never expires
      }),
    })
    
    if (!response.ok) {
      throw new Error(`VFD token generation failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.data.token // Returns JWT token
  } catch (error) {
    console.error('[v0] VFD token generation error:', error)
    throw error
  }
}

export async function vfdFetch(endpoint: string, options: RequestInit = {}) {
  const token = await generateVFDToken()
  
  const response = await fetch(`${process.env.VFD_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(errorData.message || 'VFD API request failed')
  }
  
  return response.json()
}
