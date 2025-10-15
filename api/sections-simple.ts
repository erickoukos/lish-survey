import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method === 'GET') {
    try {
      // Return hardcoded sections data
      const sections = [
        { id: 'section-a', sectionKey: 'A', title: 'General Information', description: 'Basic employee information', order: 1, isActive: true },
        { id: 'section-b', sectionKey: 'B', title: 'Awareness & Understanding', description: 'Policy awareness levels', order: 2, isActive: true },
        { id: 'section-c', sectionKey: 'C', title: 'Urgent Trainings', description: 'Immediate training needs', order: 3, isActive: true },
        { id: 'section-d', sectionKey: 'D', title: 'Finance & Wellness', description: 'Financial wellness needs', order: 4, isActive: true },
        { id: 'section-e', sectionKey: 'E', title: 'Culture & Wellness', description: 'Cultural wellness needs', order: 5, isActive: true },
        { id: 'section-f', sectionKey: 'F', title: 'Digital Skills', description: 'Digital skills development', order: 6, isActive: true },
        { id: 'section-g', sectionKey: 'G', title: 'Professional Development', description: 'Career development needs', order: 7, isActive: true },
        { id: 'section-h', sectionKey: 'H', title: 'Observed Issues', description: 'Issues observed in workplace', order: 8, isActive: true },
        { id: 'section-i', sectionKey: 'I', title: 'Training Methods', description: 'Preferred training delivery methods', order: 9, isActive: true },
        { id: 'section-j', sectionKey: 'J', title: 'Final Questions', description: 'Additional feedback and suggestions', order: 10, isActive: true }
      ]
      
      return res.status(200).json({
        success: true,
        data: sections,
        count: sections.length,
        message: 'Using simplified sections data - database not accessible'
      })
    } catch (error) {
      console.error('Sections API error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to process sections'
      })
    }
  }
  
  return res.status(405).json({ error: 'Method Not Allowed' })
}
