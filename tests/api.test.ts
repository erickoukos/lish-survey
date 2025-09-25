import request from 'supertest'
import app from '../src/server'

describe('API Endpoints', () => {
  let authToken: string

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'admin',
        password: 'lish2025'
      })
    
    authToken = loginResponse.body.token
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body.status).toBe('OK')
      expect(response.body.timestamp).toBeDefined()
    })
  })

  describe('POST /api/submit', () => {
    const validSurveyData = {
      department: 'Technical Team',
      awareness: {
        antiSocialBehavior: 4,
        antiDiscrimination: 5,
        sexualHarassment: 3,
        safeguarding: 4,
        hrPolicyManual: 2,
        codeOfConduct: 4,
        financeWellness: 3,
        workLifeBalance: 4,
        digitalWorkplace: 5,
        softSkills: 3,
        professionalism: 4
      },
      urgentTrainings: ['Anti-Social Behavior Policy'],
      confidenceLevel: 'Confident',
      facedUnsureSituation: false,
      knewReportingChannel: 'Yes',
      trainingMethod: 'In-person training sessions',
      refresherFrequency: '1 training /Monthly'
    }

    it('should submit survey response successfully', async () => {
      const response = await request(app)
        .post('/api/submit')
        .send(validSurveyData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.id).toBeDefined()
    })

    it('should reject invalid data', async () => {
      const invalidData = {
        ...validSurveyData,
        department: 'Invalid Department'
      }

      const response = await request(app)
        .post('/api/submit')
        .send(invalidData)
        .expect(400)

      expect(response.body.error).toBe('Invalid request data')
    })

    it('should reject missing required fields', async () => {
      const incompleteData = {
        department: 'Technical Team'
        // Missing required fields
      }

      const response = await request(app)
        .post('/api/submit')
        .send(incompleteData)
        .expect(400)

      expect(response.body.error).toBe('Invalid request data')
    })
  })

  describe('POST /api/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'admin',
          password: 'lish2025'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()
      expect(response.body.user.username).toBe('admin')
    })

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        })
        .expect(401)

      expect(response.body.error).toBe('Invalid credentials')
    })
  })

  describe('GET /api/responses', () => {
    it('should get responses with valid token', async () => {
      const response = await request(app)
        .get('/api/responses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.pagination).toBeDefined()
    })

    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/responses')
        .expect(401)

      expect(response.body.error).toBe('Authentication required')
    })

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/responses')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.error).toBe('Invalid token')
    })

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/responses?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(5)
    })
  })

  describe('GET /api/export', () => {
    it('should export CSV with valid token', async () => {
      const response = await request(app)
        .get('/api/export')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.headers['content-type']).toContain('text/csv')
      expect(response.headers['content-disposition']).toContain('attachment')
    })

    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/export')
        .expect(401)

      expect(response.body.error).toBe('Authentication required')
    })
  })
})
