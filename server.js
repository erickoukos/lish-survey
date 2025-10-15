const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = 3000

// Enable CORS
app.use(cors())

// Serve static files from frontend/dist
app.use(express.static(path.join(__dirname, 'frontend/dist')))

// API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'development',
    database: {
      connected: true,
      responseCount: 2
    }
  })
})

app.get('/api/department-counts', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'hod-1', department: 'Head of Department (HODs)', staffCount: 7, responseCount: 0, remainingCount: 7, responseRate: 0, isActive: true },
      { id: 'tech-1', department: 'Technical Team', staffCount: 54, responseCount: 2, remainingCount: 52, responseRate: 3.7, isActive: true },
      { id: 'data-1', department: 'Data Annotation Team', staffCount: 70, responseCount: 0, remainingCount: 70, responseRate: 0, isActive: true },
      { id: 'marketing-1', department: 'Digital Marketing Department', staffCount: 5, responseCount: 0, remainingCount: 5, responseRate: 0, isActive: true },
      { id: 'hr-1', department: 'HR & Administration Department', staffCount: 3, responseCount: 0, remainingCount: 3, responseRate: 0, isActive: true },
      { id: 'finance-1', department: 'Finance & Accounting Department', staffCount: 1, responseCount: 0, remainingCount: 1, responseRate: 0, isActive: true },
      { id: 'pm-1', department: 'Project Management Department', staffCount: 1, responseCount: 0, remainingCount: 1, responseRate: 0, isActive: true },
      { id: 'sanitation-1', department: 'Sanitation Department', staffCount: 2, responseCount: 0, remainingCount: 2, responseRate: 0, isActive: true },
      { id: 'security-1', department: 'Security Department', staffCount: 4, responseCount: 0, remainingCount: 4, responseRate: 0, isActive: true }
    ],
    totalExpected: 147,
    totalResponses: 2,
    totalRemaining: 145,
    overallResponseRate: 1.36,
    count: 9,
    message: 'Department counts retrieved successfully'
  })
})

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('API endpoints available:')
  console.log('  GET /api/health')
  console.log('  GET /api/department-counts')
})
