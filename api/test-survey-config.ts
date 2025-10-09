import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Test survey config API called:', req.method, req.url)
  console.log('Request body:', JSON.stringify(req.body, null, 2))
  console.log('Request headers:', JSON.stringify(req.headers, null, 2))
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  return res.status(200).json({
    success: true,
    message: 'Test endpoint working',
    method: req.method,
    body: req.body,
    headers: req.headers
  })
}
