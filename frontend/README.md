# LISH AI LABS Policy Survey Frontend

A modern React application for the LISH AI LABS Policy Awareness & Training Needs Survey, built with Vite, TypeScript, and Tailwind CSS.

## Features

- **Multi-Section Survey Form**: Comprehensive 10-section survey covering all policy areas
- **Real-time Validation**: Zod schema validation with React Hook Form
- **Admin Dashboard**: Protected admin interface with analytics and data export
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Performance Optimized**: Code splitting, lazy loading, and Vercel optimization
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context + TanStack Query
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── survey-sections/  # Individual survey sections
│   │   └── admin/           # Admin dashboard components
│   ├── contexts/            # React contexts (Auth)
│   ├── lib/                 # Utilities and API
│   └── main.tsx            # App entry point
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── vercel.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Edit .env.local with your API URL
VITE_API_URL=http://localhost:5000
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env.local` file with:

```bash
# API Configuration
VITE_API_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME="LISH AI LABS Policy Survey"
VITE_APP_VERSION="1.0.0"
```

## Survey Sections

The survey is divided into 10 comprehensive sections:

1. **Section A**: General Information (Department)
2. **Section B**: Awareness & Understanding (Policy ratings)
3. **Section C**: Training Needs & Gaps (Urgent trainings)
4. **Section D**: Finance & Financial Wellness
5. **Section E**: Culture & Wellness
6. **Section F**: Digital Workplace & Skills
7. **Section G**: Professional Development
8. **Section H**: Workplace Practices
9. **Section I**: Training Preferences
10. **Section J**: Open Feedback

## Admin Dashboard

### Features

- **Responses Table**: View all survey responses with pagination and filtering
- **Analytics Dashboard**: Charts and statistics for data insights
- **CSV Export**: Download all responses as CSV
- **Authentication**: JWT-based admin access
- **Real-time Updates**: Live data refresh

### Access

1. Navigate to `/login`
2. Use admin credentials (configured in backend)
3. Access dashboard at `/admin`

## API Integration

The frontend connects to the backend API endpoints:

- `POST /api/submit` - Submit survey response
- `POST /api/login` - Admin authentication
- `GET /api/responses` - Get paginated responses
- `GET /api/export` - Export CSV data

## Styling

### Design System

- **Colors**: Primary blue theme with secondary grays
- **Typography**: Inter font family
- **Components**: Reusable component classes
- **Responsive**: Mobile-first design approach

### Custom Classes

```css
.btn-primary     /* Primary button styling */
.btn-secondary   /* Secondary button styling */
.form-input      /* Input field styling */
.form-textarea   /* Textarea styling */
.card           /* Card container */
.progress-bar   /* Progress indicator */
```

## Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Bundle Optimization**: Vendor chunk separation
- **Image Optimization**: Vite asset optimization
- **Caching**: TanStack Query for API caching

## Accessibility

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG compliant color schemes
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Proper HTML structure

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
VITE_API_URL=https://your-backend.vercel.app
```

### Environment Variables for Production

Set these in your Vercel dashboard:

- `VITE_API_URL` - Your backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Include accessibility features
5. Test on multiple devices

## License

MIT License - see LICENSE file for details.

