import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Department counts API called:', req.method, req.url, new Date().toISOString())
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json')
  
  // Add a simple health check
  if (req.url === '/api/department-counts/health') {
    return res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Department counts API is working' 
    })
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method === 'GET') {
    try {
      console.log('Processing GET request for department counts')
      
      // Return hardcoded LISH AI LABS department data
      const departments = [
        { id: 'hod-1', department: 'Head of Department (HODs)', staffCount: 7, responseCount: 0, remainingCount: 7, responseRate: 0, isActive: true },
        { id: 'tech-1', department: 'Technical Team', staffCount: 54, responseCount: 0, remainingCount: 54, responseRate: 0, isActive: true },
        { id: 'data-1', department: 'Data Annotation Team', staffCount: 70, responseCount: 0, remainingCount: 70, responseRate: 0, isActive: true },
        { id: 'marketing-1', department: 'Digital Marketing Department', staffCount: 5, responseCount: 0, remainingCount: 5, responseRate: 0, isActive: true },
        { id: 'hr-1', department: 'HR & Administration Department', staffCount: 3, responseCount: 0, remainingCount: 3, responseRate: 0, isActive: true },
        { id: 'finance-1', department: 'Finance & Accounting Department', staffCount: 1, responseCount: 0, remainingCount: 1, responseRate: 0, isActive: true },
        { id: 'pm-1', department: 'Project Management Department', staffCount: 1, responseCount: 0, remainingCount: 1, responseRate: 0, isActive: true },
        { id: 'sanitation-1', department: 'Sanitation Department', staffCount: 2, responseCount: 0, remainingCount: 2, responseRate: 0, isActive: true },
        { id: 'security-1', department: 'Security Department', staffCount: 4, responseCount: 0, remainingCount: 4, responseRate: 0, isActive: true }
      ]
      
      const totalExpected = departments.reduce((sum, dept) => sum + dept.staffCount, 0)
      const totalResponses = 0 // No responses yet
      const totalRemaining = totalExpected - totalResponses
      
      const response = {
        success: true,
        data: departments,
        totalExpected,
        totalResponses,
        totalRemaining,
        overallResponseRate: 0,
        count: departments.length,
        message: 'Department counts API working correctly'
      }
      
      console.log('Department counts response:', JSON.stringify(response, null, 2))
      console.log('Total expected responses:', totalExpected)
      
      return res.status(200).json(response)
    } catch (error) {
      console.error('Department counts API error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to process department counts'
      })
    }
  }
  
  return res.status(405).json({ error: 'Method Not Allowed' })
}