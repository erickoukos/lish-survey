# 🚀 Quick Start Guide - LISH AI LABS Policy Survey

## **Current Status: ✅ SERVERS RUNNING**

Your development environment is already set up and running! Here's what you have:

### **🌐 Access Your Application:**

1. **Frontend (Survey Form)**: http://localhost:3000
2. **Backend API**: http://localhost:5000
3. **Admin Login**: http://localhost:3000/login

---

## **📋 Step-by-Step Setup (If Starting Fresh)**

### **1. Backend Setup**
```bash
# Navigate to project root
cd C:\xampp\htdocs\lish-survey

# Install dependencies
npm install

# Start backend server
npm run start:dev
```

### **2. Frontend Setup (New Terminal)**
```bash
# Navigate to frontend
cd C:\xampp\htdocs\lish-survey\frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

---

## **🎯 What You Can Do Right Now**

### **1. Test the Survey Form**
- Open: http://localhost:3000
- Fill out the 10-section survey
- Test form validation
- Submit responses

### **2. Test Admin Dashboard**
- Go to: http://localhost:3000/login
- Login with: `admin` / `lish2025`
- View responses and analytics
- Export data as CSV

### **3. Test API Endpoints**
```bash
# Health check
curl http://localhost:5000/health

# Test survey submission
curl -X POST http://localhost:5000/api/submit -H "Content-Type: application/json" -d '{"department":"Technical Team","awareness":{"antiSocialBehavior":4},"urgentTrainings":["Anti-Social Behavior Policy"],"confidenceLevel":"Confident","facedUnsureSituation":false,"knewReportingChannel":"Yes","trainingMethod":"In-person training sessions","refresherFrequency":"1 training /Monthly"}'
```

---

## **🗄️ Database Setup (Optional for Full Testing)**

### **Option 1: Use Neon (Recommended)**
1. Go to [Neon.tech](https://neon.tech)
2. Create a free database
3. Copy the connection string
4. Update `.env.local`:
```bash
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/lish_survey?sslmode=require"
```

### **Option 2: Local PostgreSQL**
1. Install PostgreSQL locally
2. Create database: `lish_survey`
3. Update `.env.local`:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/lish_survey?schema=public"
```

### **Run Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Add sample data
npm run db:seed
```

---

## **🔧 Troubleshooting**

### **If Backend Won't Start:**
```bash
# Use Express server instead of Vercel
npm run start:dev
```

### **If Frontend Won't Start:**
```bash
# Check if port 3000 is free
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID_NUMBER> /F
```

### **If Database Connection Fails:**
- Check your DATABASE_URL in `.env.local`
- Ensure database exists
- Run `npm run db:generate` first

---

## **📱 Testing the Application**

### **1. Survey Flow**
1. Open http://localhost:3000
2. Select your department
3. Rate policy awareness (1-5 scale)
4. Select training needs
5. Complete all 10 sections
6. Submit survey

### **2. Admin Flow**
1. Go to http://localhost:3000/login
2. Login with admin credentials
3. View submitted responses
4. Check analytics dashboard
5. Export data as CSV

### **3. API Testing**
```bash
# Test all endpoints
npm run test:manual
```

---

## **🚀 Deployment (When Ready)**

### **Backend to Vercel:**
```bash
vercel --prod
```

### **Frontend to Vercel:**
```bash
cd frontend
vercel --prod
```

---

## **✅ You're All Set!**

Your LISH AI LABS Policy Survey application is running locally and ready for testing. The complete survey form, admin dashboard, and API are all functional.

**Next Steps:**
1. Test the survey form
2. Set up database (optional)
3. Test admin features
4. Deploy when ready

**Need Help?** Check the `LOCAL_TESTING.md` file for detailed instructions.

