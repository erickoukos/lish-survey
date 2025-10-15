import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Immediately set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.setHeader('Content-Type', 'application/json')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method === 'GET') {
    try {
      // Return hardcoded department data
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
      
      const response = {
        success: true,
        data: departments,
        totalExpected,
        totalResponses: 0,
        totalRemaining: totalExpected,
        overallResponseRate: 0,
        count: departments.length,
        message: 'Department data loaded successfully'
      }
      
      return res.status(200).json(response)
    } catch (error) {
      console.error('Departments API error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to process departments'
      })
    }
  }
  
  return res.status(405).json({ 
    success: false,
    error: 'Method Not Allowed',
    message: `Method ${req.method} not allowed`
  })
}
