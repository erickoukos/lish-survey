import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Simple test API called:', req.method, req.url, new Date().toISOString())
  
  return res.status(200).json({
    success: true,
    message: 'Simple test API is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  })
}
