# Prompt 1: Backend Setup and API (Prisma + Postgres Schema + Submission Endpoint)

As a senior full-stack engineer, create a Node.js/Express backend for an anonymous HR survey app called "LISH AI LABS Policy Survey". Use TypeScript, PostgreSQL via Prisma ORM (for Neon serverless DB), and dotenv for env vars. Optimize for Vercel deployment (serverless functions) with proper cold start optimization and connection pooling.

1. Project structure: /api (vercel serverless functions), /src (shared utilities), /prisma (schema.prisma), package.json with deps: express, @prisma/client, prisma, cors, helmet, rate-limiter-flexible, csv-writer, @types/*, vercel (for deployment), @vercel/node.

2. Prisma Schema (schema.prisma): Connect to DATABASE_URL (Neon Postgres with connection pooling). Table "SurveyResponse" (id: uuid primary, anonymous):
   - department: String (enum: ['Head of Department (HODs)', 'Technical Team', 'Data Annotation Team', 'Digital Marketing Department', 'HR & Administration Department', 'Finance & Accounting Department', 'Project Management Department', 'Sanitation Department', 'Security Department'])
   - awareness: Json (object with keys: antiSocialBehavior: Int (1-5), antiDiscrimination: Int, sexualHarassment: Int, safeguarding: Int, hrPolicyManual: Int, codeOfConduct: Int, financeWellness: Int, workLifeBalance: Int, digitalWorkplace: Int, softSkills: Int, professionalism: Int)
   - urgentTrainings: String[] (options: 'Anti-Social Behavior Policy', 'Anti-Discrimination Policy', 'HR Policy Manual', 'Code of Conduct', 'Safeguarding Policy', 'Sexual and Other forms of harassment Policy', 'Finance & Financial Wellness', 'Work-Life Balance & Mental Health Awareness', 'Digital Workplace & Skills', 'Soft Skills')
   - urgentTrainingsOther: String? (optional)
   - financeWellnessNeeds: String[] (options: 'Financial Literacy Basics – Saving, spending, and tracking money smartly', 'Digital Finance Tools – Mobile banking, and expense tracking', 'Investment & Savings Options – youth-friendly investment paths like SACCOs, money markets, and digital assets', 'Debt Management – responsible use of loans, credit, and avoiding financial stress')
   - cultureWellnessNeeds: String[] (options: 'Stress management strategies for high-paced digital environments', 'Recognizing burnout and early warning signs', 'Accessing mental health resources and support', 'Avoiding digital fatigue and information overload (Healthy Tech Use)', 'Self-awareness and emotional regulation', 'Understanding others’ perspectives (empathy)', 'Using emotional intelligence for leadership and teamwork', 'Resilience & Adaptability Training', 'Wellness & Lifestyle Management', 'Diversity, Equity & Inclusion (DEI) Awareness')
   - cultureWellnessOther: String? (optional)
   - digitalSkillsNeeds: String[] (options: 'Cybersecurity Awareness', 'Responsible AI & Ethical Tech Use', 'Data Privacy & Compliance')
   - digitalSkillsOther: String? (optional)
   - professionalDevNeeds: String[] (options: 'Effective Communication', 'Leadership Skills for Young Professionals', 'Entrepreneurial Mindset & Intrapreneurship', 'Personal Branding & Professional Networking', 'Teamwork & Conflict Resolution', 'Time Management & Productivity Tools')
   - professionalDevOther: String? (optional)
   - confidenceLevel: String (enum: 'Not confident at all', 'Slightly confident', 'Neutral', 'Confident', 'Very confident')
   - facedUnsureSituation: Boolean
   - unsureSituationDescription: String? (optional)
   - observedIssues: String[] (options: 'Anti-social behavior (e.g., verbal abuse, public disorder)', 'Discrimination (e.g., gender, race, disability bias)', 'Harassment (verbal, physical, sexual, cyber)', 'Lack of safeguarding for vulnerable persons (Women, PWDs, Senior Citizens)', 'None of the above')
   - observedIssuesOther: String? (optional)
   - knewReportingChannel: String (enum: 'Yes', 'No', 'Not sure')
   - trainingMethod: String (enum: 'In-person training sessions', 'Self-paced e-learning modules', 'Shared Policy handbooks')
   - trainingMethodOther: String? (optional)
   - refresherFrequency: String (enum: '1 training /Week', '1 training /Monthly', '2 trainings /Month')
   - prioritizedPolicies: String (open text)
   - prioritizationReason: String (open text)
   - policyChallenges: String (open text)
   - complianceSuggestions: String (open text)
   - generalComments: String (open text)
   - createdAt: DateTime @default(now()) @map("timestamp")

3. Vercel Serverless Functions (using Prisma Client with connection pooling):
   - /api/submit.ts: Validate body with Zod (required: department, awareness, urgentTrainings; others optional), create SurveyResponse, return {success: true, id: response.id}. Rate limit to 5/min/IP using Redis or in-memory store.
   - /api/responses.ts: Admin-only (JWT auth), return paginated list (query params: page, limit=10, filter by department) using Prisma findMany with skip/take.
   - /api/export.ts: Return CSV of all responses using csv-writer (columns match schema).
   - /api/login.ts: JWT authentication endpoint for admin access.

4. Vercel Configuration:
   - vercel.json: Configure functions with proper timeout (30s), memory (1024MB), and regions
   - Environment variables: DATABASE_URL, JWT_SECRET, RATE_LIMIT_REDIS_URL (optional)
   - Prisma connection pooling for serverless: Use connection pooling URL from Neon
   - CORS for Vercel frontend domain and localhost:3000
   - Security headers with helmet

5. Deployment Optimization:
   - Include .env.example (DATABASE_URL with pooling, JWT_SECRET)
   - Prisma generate in build process
   - Database migrations with npx prisma db push
   - Cold start optimization: Lazy Prisma client initialization
   - Error handling with proper HTTP status codes and structured logging

Generate all files, including schema.prisma, .env.example, vercel.json, tsconfig.json, and individual API route files. Include comprehensive error handling, request validation, and performance monitoring.

# Prompt 2: Frontend Survey Form Component

As a senior React engineer, build a TypeScript React app for the "LISH AI LABS Policy Awareness & Training Needs Survey" form. Use Vite for faster builds (Vercel-optimized), React Hook Form with Zod for validation, Tailwind CSS (professional blue/gray theme), and Axios for API calls. Include placeholders for image1.png (header logo) and image2.png (footer branding) in /public.

1. vite.config.ts: Optimized setup with React plugin, build optimizations for Vercel deployment, and proper asset handling.

2. App.tsx: Header with image1.png and title ("LISH AI LABS Policy Survey"), SurveyForm component, Footer with image2.png. On submit, POST to /api/submit (Vercel serverless function) with proper error handling and retry logic, show success modal (react-hot-toast) or redirect to /thank-you.

3. SurveyForm component: Multi-section form matching the document exactly:
   - Section A: General Information
     - Q1: Radio group for Department (enum: 'Head of Department (HODs)', 'Technical Team', 'Data Annotation Team', 'Digital Marketing Department', 'HR & Administration Department', 'Finance & Accounting Department', 'Project Management Department', 'Sanitation Department', 'Security Department')
   - Section B: Awareness & Understanding
     - Q2: Likert scale (1=Not aware, 2=Heard of it, 3=Somewhat familiar, 4=Familiar, 5=Fully understand & can apply) for:
       - Anti-Social Behavior Policy
       - Anti-Discrimination Policy
       - Sexual & Other forms of harassment Policy
       - Safeguarding Policy
       - HR Policy Manual
       - Code of Conduct
       - Finance & Financial Wellness
       - Work-Life Balance & Mental Health Awareness
       - Digital Workplace & Skills
       - Soft Skills
       - Professionalism at Work Place
   - Section C: Training Needs & Gaps
     - Q3: Checkboxes (multi-select) for urgent training/clarification: Anti-Social Behavior Policy, Anti-Discrimination Policy, HR Policy Manual, Code of Conduct, Safeguarding Policy, Sexual and Other forms of harassment Policy, Finance & Financial Wellness, Work-Life Balance & Mental Health Awareness, Digital Workplace & Skills, Soft Skills, Others (text input if selected)
   - Section D: Training Needs – Finance & Financial Wellness
     - Q4: Checkboxes (multi-select): Financial Literacy Basics – Saving, spending, and tracking money smartly; Digital Finance Tools – Mobile banking, and expense tracking; Investment & Savings Options – youth-friendly investment paths like SACCOs, money markets, and digital assets; Debt Management – responsible use of loans, credit, and avoiding financial stress
   - Section E: Training Needs – Culture & Wellness
     - Q5: Checkboxes (multi-select): Stress management strategies for high-paced digital environments, Recognizing burnout and early warning signs, Accessing mental health resources and support, Avoiding digital fatigue and information overload (Healthy Tech Use), Self-awareness and emotional regulation, Understanding others’ perspectives (empathy), Using emotional intelligence for leadership and teamwork, Resilience & Adaptability Training, Wellness & Lifestyle Management, Diversity, Equity & Inclusion (DEI) Awareness, Others (text input if selected)
   - Section F: Training Needs – Digital Workplace & Skills
     - Q6: Checkboxes (multi-select): Cybersecurity Awareness, Responsible AI & Ethical Tech Use, Data Privacy & Compliance, Others (text input if selected)
   - Section G: Professional Development
     - Q7: Checkboxes (multi-select): Effective Communication, Leadership Skills for Young Professionals, Entrepreneurial Mindset & Intrapreneurship, Personal Branding & Professional Networking, Teamwork & Conflict Resolution, Time Management & Productivity Tools, Others (text input if selected)
     - Q8: Radio for confidence in applying policies: Not confident at all, Slightly confident, Neutral, Confident, Very confident
     - Q9: Radio for faced unsure situation: Yes, No (if Yes, show textarea for description)
   - Section H: Workplace Practices
     - Q10: Checkboxes (multi-select): Anti-social behavior (e.g., verbal abuse, public disorder), Discrimination (e.g., gender, race, disability bias), Harassment (verbal, physical, sexual, cyber), Lack of safeguarding for vulnerable persons (Women, PWDs, Senior Citizens), None of the above, Others (text input if selected)
     - Q11: Radio for knew reporting channel: Yes, No, Not sure
   - Section I: Training Preferences
     - Q12: Radio for training method: In-person training sessions, Self-paced e-learning modules, Shared Policy handbooks, Others (text input if selected)
     - Q13: Radio for refresher frequency: 1 training /Week, 1 training /Monthly, 2 trainings /Month
   - Section J: Open Feedback
     - Q14: Textarea for prioritized policies
     - Q15: Textarea for why prioritized
     - Q16: Textarea for challenges in understanding/applying policies
     - Q17: Textarea for suggestions for improving policy awareness/compliance
     - Q18: Textarea for general comments

4. Validation: Required fields: department, all awareness scales (1-5), at least one urgent training. Use watch() for conditional fields (e.g., Others text, unsure situation description). Implement client-side validation with Zod schema and server-side validation feedback.

5. Styling: Clean, accessible (ARIA labels), responsive grid for Likert scales/checkboxes. Add progress bar for sections. Blue/gray theme, professional fonts. Optimize for mobile-first design and Vercel's edge network.

6. Performance Optimizations:
   - Lazy loading for form sections
   - Debounced form validation
   - Optimized bundle splitting
   - Image optimization for logos
   - Service worker for offline capability

7. package.json deps: react-hook-form, @hookform/resolvers/zod, axios, tailwindcss, react-hot-toast, vite, @vitejs/plugin-react, @vercel/analytics.

Generate all components, Zod schema, App.tsx, tailwind.config.js, and index.html. Include submit handler with loading spinner, error/success toast, and retry mechanism. Add vercel.json for frontend deployment with proper build settings and environment variables.

# Prompt 3: Admin Dashboard for Viewing Responses
As a senior full-stack engineer, extend the React frontend from the previous prompt with an AdminDashboard component. Implement JWT-based authentication with secure token storage and automatic refresh. Fetch responses from /api/responses (Vercel serverless function) with proper error handling and retry logic.

1. Login.tsx: Secure form (username, password) with proper validation, redirect to /admin on success. Include loading states and error handling.

2. AdminDashboard.tsx: Advanced table view using TanStack React Table (sortable/filterable/virtualized):
   - Columns: createdAt (Timestamp), Department, Awareness Scores (average or summary from JSON), Urgent Trainings (comma-separated), Finance Wellness Needs, Culture Wellness Needs, Digital Skills Needs, Professional Dev Needs, Confidence Level, Faced Unsure Situation, Observed Issues, Knew Reporting Channel, Training Method, Refresher Frequency, Open Feedback (truncated, expandable).
   - Advanced Filters: Dropdown for department, search for open text fields, date range picker, confidence level filter.
   - Pagination: Configurable (10/25/50/100 per page) with server-side pagination.
   - Export functionality: Fetch /api/export with progress indicator, download as CSV with proper filename.
   - Real-time updates: Optional WebSocket or polling for new responses.

3. Integration: Protected route (/admin) with useAuth hook and route guards. Update App.tsx with react-router-dom and proper error boundaries.

4. Styling: Match survey's blue/gray theme, responsive, accessible. Include dark mode toggle and high contrast mode for accessibility.

5. Analytics Dashboard: 
   - Pie chart showing distribution of confidence levels
   - Bar chart for department-wise response counts
   - Line chart for response trends over time
   - Summary statistics cards

6. Security Features:
   - XSS protection with data sanitization
   - CSRF protection
   - Rate limiting on admin actions
   - Session timeout handling
   - Secure logout with token invalidation

7. Deps: @tanstack/react-table, react-router-dom, recharts, react-hot-toast, @tanstack/react-query, date-fns.

Generate Login.tsx, AdminDashboard.tsx, AuthContext.tsx, Analytics components, and update App.tsx with routes. Include comprehensive error handling, loading states, and ensure full Vercel compatibility with optimized bundle splitting.

# Prompt 4: Full Integration and Polish (Vercel + Neon Deployment)
As a senior engineer, refine the LISH AI LABS survey app from previous prompts for production-ready Vercel + Neon Postgres deployment:

1. Backend Optimization:
   - JWT authentication with refresh tokens (jsonwebtoken, bcrypt)
   - Secure API endpoints with proper middleware
   - Prisma connection pooling for serverless functions
   - Rate limiting with Redis or in-memory store
   - Comprehensive error handling and logging
   - Input validation and sanitization
   - CORS configuration for production domains

2. Frontend Enhancement:
   - JWT auth integration with automatic token refresh
   - Optimized bundle splitting and lazy loading
   - Progressive Web App (PWA) capabilities
   - Offline functionality with service workers
   - Performance monitoring with Vercel Analytics
   - SEO optimization and meta tags

3. Database Setup:
   - Neon Postgres with connection pooling
   - Environment variables configuration
   - Database migrations and seeding
   - Backup and recovery procedures
   - Performance monitoring and optimization

4. Production Error Handling:
   - React error boundaries with fallback UI
   - Global error handling for API calls
   - User-friendly error messages
   - Error reporting and monitoring
   - Graceful degradation for network issues

5. Comprehensive Testing:
   - Unit tests for form validation (@testing-library/react)
   - Integration tests for API endpoints (Jest/Supertest)
   - E2E tests with Playwright
   - Performance testing and optimization
   - Security testing and vulnerability scanning

6. Deployment & DevOps:
   - Automated CI/CD pipeline with GitHub Actions
   - Environment-specific configurations
   - Database migration automation
   - Monitoring and alerting setup
   - Backup and disaster recovery
   - Performance optimization and caching

7. Documentation & Maintenance:
   - Comprehensive README.md with setup instructions
   - API documentation with examples
   - Deployment guide for different environments
   - Troubleshooting guide
   - Maintenance procedures and best practices

Generate all necessary files, configurations, and documentation. Ensure production-ready security, performance, and reliability standards. Include monitoring, logging, and maintenance procedures for long-term success.

