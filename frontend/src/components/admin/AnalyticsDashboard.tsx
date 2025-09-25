import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, Target, CheckCircle } from 'lucide-react'

const AnalyticsDashboard: React.FC = () => {
  const { data: responsesData } = useQuery({
    queryKey: ['responses', { page: 1, limit: 1000 }],
    queryFn: () => adminApi.getResponses({ page: 1, limit: 1000 })
  })

  const responses = responsesData?.data || []

  // Debug logging
  console.log('Analytics Dashboard - Raw responses:', responses)
  console.log('Analytics Dashboard - Responses count:', responses.length)

  // Process data for charts with comprehensive validation
  const confidenceData = responses.reduce((acc: any, response: any) => {
    const level = response.confidenceLevel
    if (level && typeof level === 'string' && level.trim()) {
      acc[level] = (acc[level] || 0) + 1
    }
    return acc
  }, {})

  const confidenceChartData = (() => {
    const validData = Object.entries(confidenceData)
      .filter(([name, value]) => value > 0 && !isNaN(value as number))
      .map(([name, value]) => ({
        name,
        value: Math.max(0, value as number)
      }))
    return validData.length > 0 ? validData : [{ name: 'No Data', value: 1 }]
  })()

  const departmentData = responses.reduce((acc: any, response: any) => {
    const dept = response.department
    if (dept && typeof dept === 'string' && dept.trim()) {
      acc[dept] = (acc[dept] || 0) + 1
    }
    return acc
  }, {})

  const departmentChartData = (() => {
    const validData = Object.entries(departmentData)
      .filter(([name, value]) => value > 0 && !isNaN(value as number))
      .map(([name, value]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        value: Math.max(0, value as number)
      }))
    return validData.length > 0 ? validData : [{ name: 'No Data', fullName: 'No Data', value: 1 }]
  })()

  const awarenessData = responses.reduce((acc: any, response: any) => {
    try {
      // Handle both object and JSON string formats
      const awareness = typeof response.awareness === 'string' 
        ? JSON.parse(response.awareness) 
        : response.awareness
      
      if (awareness && typeof awareness === 'object') {
        Object.entries(awareness).forEach(([key, value]) => {
          if (typeof value === 'number' && !isNaN(value)) {
            acc[key] = (acc[key] || 0) + value
          }
        })
      }
    } catch (error) {
      console.error('Error parsing awareness data:', error)
    }
    return acc
  }, {})

  const awarenessChartData = (() => {
    const validData = Object.entries(awarenessData)
      .filter(([name, total]) => total > 0 && !isNaN(total as number))
      .map(([name, total]) => ({
        name: name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        average: Math.max(0, Math.min(5, (total as number) / responses.length)) // Clamp between 0 and 5
      }))
    return validData.length > 0 ? validData : [{ name: 'No Data', average: 0 }]
  })()

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const totalResponses = responses.length
  const averageAwareness = responses.length > 0 
    ? (responses.reduce((sum: number, r: any) => {
        try {
          const awareness = typeof r.awareness === 'string' 
            ? JSON.parse(r.awareness) 
            : r.awareness
          const values = Object.values(awareness || {}).filter(v => typeof v === 'number' && !isNaN(v)) as number[]
          return sum + (values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0)
        } catch (error) {
          console.error('Error calculating awareness average:', error)
          return sum
        }
      }, 0) / responses.length).toFixed(1)
    : 0

  const highConfidenceCount = responses.filter((r: any) => 
    r.confidenceLevel === 'Very confident' || r.confidenceLevel === 'Confident'
  ).length

  const unsureSituationCount = responses.filter((r: any) => r.facedUnsureSituation).length

  // Debug logging for processed data
  console.log('Analytics Dashboard - Confidence data:', confidenceChartData)
  console.log('Analytics Dashboard - Department data:', departmentChartData)
  console.log('Analytics Dashboard - Awareness data:', awarenessChartData)

  // Add loading state and error handling
  if (!responsesData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Responses</p>
                <p className="text-2xl font-bold text-secondary-900">{totalResponses}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Average Awareness</p>
                <p className="text-2xl font-bold text-secondary-900">{averageAwareness}/5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">High Confidence</p>
                <p className="text-2xl font-bold text-secondary-900">{highConfidenceCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Faced Unsure Situations</p>
                <p className="text-2xl font-bold text-secondary-900">{unsureSituationCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Level Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Confidence Level Distribution</h3>
          </div>
          <div className="card-content">
            {confidenceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={confidenceChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {confidenceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-secondary-500">
                No confidence level data available
              </div>
            )}
          </div>
        </div>

        {/* Department Responses */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Responses by Department</h3>
          </div>
          <div className="card-content">
            {departmentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-secondary-500">
                No department data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Awareness Scores */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Average Awareness Scores by Policy</h3>
        </div>
        <div className="card-content">
          {awarenessChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={awarenessChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="average" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-secondary-500">
              No awareness data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
