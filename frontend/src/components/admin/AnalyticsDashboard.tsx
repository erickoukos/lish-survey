import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, ScatterChart, Scatter } from 'recharts'
import { Users, TrendingUp, Target, CheckCircle, AlertTriangle, Award, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react'

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

  // Professional color scheme
  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981', 
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    teal: '#14b8a6',
    orange: '#f97316',
    pink: '#ec4899',
    indigo: '#6366f1',
    emerald: '#059669'
  }

  const CHART_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.purple, COLORS.teal, COLORS.orange, COLORS.pink, COLORS.indigo, COLORS.emerald]

  const totalResponses = responses.length
  
  // Enhanced awareness calculation
  const awarenessScores = responses.map((r: any) => {
    try {
      const awareness = typeof r.awareness === 'string' 
        ? JSON.parse(r.awareness) 
        : r.awareness
      const values = Object.values(awareness || {}).filter(v => typeof v === 'number' && !isNaN(v)) as number[]
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
    } catch (error) {
      return 0
    }
  })

  const averageAwareness = awarenessScores.length > 0 
    ? (awarenessScores.reduce((sum, score) => sum + score, 0) / awarenessScores.length).toFixed(1)
    : 0

  const highConfidenceCount = responses.filter((r: any) => 
    r.confidenceLevel === 'Very confident' || r.confidenceLevel === 'Confident'
  ).length

  const unsureSituationCount = responses.filter((r: any) => r.facedUnsureSituation).length

  // New analytics metrics
  const lowAwarenessCount = awarenessScores.filter(score => score < 2.5).length
  const highAwarenessCount = awarenessScores.filter(score => score >= 4).length
  const completionRate = totalResponses > 0 ? ((totalResponses / (totalResponses + 0)) * 100).toFixed(1) : 0

  // Department performance analysis
  const departmentPerformance = Object.entries(departmentData).map(([dept, count]) => {
    const deptResponses = responses.filter((r: any) => r.department === dept)
    const deptAwarenessScores = deptResponses.map((r: any) => {
      try {
        const awareness = typeof r.awareness === 'string' 
          ? JSON.parse(r.awareness) 
          : r.awareness
        const values = Object.values(awareness || {}).filter(v => typeof v === 'number' && !isNaN(v)) as number[]
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      } catch (error) {
        return 0
      }
    })
    const avgAwareness = deptAwarenessScores.length > 0 
      ? deptAwarenessScores.reduce((sum, score) => sum + score, 0) / deptAwarenessScores.length 
      : 0
    
    return {
      department: dept,
      responses: count,
      averageAwareness: avgAwareness.toFixed(1),
      performance: avgAwareness >= 4 ? 'Excellent' : avgAwareness >= 3 ? 'Good' : avgAwareness >= 2 ? 'Fair' : 'Needs Improvement'
    }
  }).sort((a, b) => b.averageAwareness - a.averageAwareness)

  // Policy priority analysis
  const policyPriorityData = responses.reduce((acc: any, response: any) => {
    if (response.prioritizedPolicies && Array.isArray(response.prioritizedPolicies)) {
      response.prioritizedPolicies.forEach((policy: string) => {
        acc[policy] = (acc[policy] || 0) + 1
      })
    }
    return acc
  }, {})

  const policyPriorityChartData = Object.entries(policyPriorityData)
    .map(([policy, count]) => ({
      policy: policy.length > 30 ? policy.substring(0, 30) + '...' : policy,
      fullPolicy: policy,
      count: count as number,
      percentage: totalResponses > 0 ? ((count as number) / totalResponses * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8) // Top 8 most prioritized policies

  // Confidence vs Awareness correlation
  const confidenceAwarenessData = responses.map((r: any) => {
    const confidenceScore = r.confidenceLevel === 'Very confident' ? 5 : 
                           r.confidenceLevel === 'Confident' ? 4 :
                           r.confidenceLevel === 'Somewhat confident' ? 3 :
                           r.confidenceLevel === 'Not very confident' ? 2 : 1
    
    const awarenessScore = (() => {
      try {
        const awareness = typeof r.awareness === 'string' 
          ? JSON.parse(r.awareness) 
          : r.awareness
        const values = Object.values(awareness || {}).filter(v => typeof v === 'number' && !isNaN(v)) as number[]
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      } catch (error) {
        return 0
      }
    })()

    return {
      confidence: confidenceScore,
      awareness: awarenessScore,
      department: r.department
    }
  })

  // Enhanced awareness chart data with better formatting
  const enhancedAwarenessChartData = Object.entries(awarenessData)
    .filter(([name, total]) => total > 0 && !isNaN(total as number))
    .map(([name, total]) => {
      const average = Math.max(0, Math.min(5, (total as number) / responses.length))
      const percentage = (average / 5) * 100
      return {
        name: name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        average: average,
        percentage: percentage,
        status: average >= 4 ? 'Excellent' : average >= 3 ? 'Good' : average >= 2 ? 'Fair' : 'Needs Improvement',
        color: average >= 4 ? COLORS.success : average >= 3 ? COLORS.primary : average >= 2 ? COLORS.warning : COLORS.danger
      }
    })
    .sort((a, b) => b.average - a.average)

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
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Total Responses</p>
                  <p className="text-2xl font-bold text-blue-900">{totalResponses}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600 font-medium">Completion Rate</div>
                <div className="text-lg font-semibold text-blue-800">{completionRate}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Average Awareness</p>
                  <p className="text-2xl font-bold text-green-900">{averageAwareness}/5</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600 font-medium">High Awareness</div>
                <div className="text-lg font-semibold text-green-800">{highAwarenessCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">High Confidence</p>
                  <p className="text-2xl font-bold text-purple-900">{highConfidenceCount}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-purple-600 font-medium">Confidence Rate</div>
                <div className="text-lg font-semibold text-purple-800">
                  {totalResponses > 0 ? ((highConfidenceCount / totalResponses) * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-700">Needs Attention</p>
                  <p className="text-2xl font-bold text-orange-900">{lowAwarenessCount}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-orange-600 font-medium">Unsure Situations</div>
                <div className="text-lg font-semibold text-orange-800">{unsureSituationCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Level Distribution */}
        <div className="card border-l-4 border-l-blue-500">
          <div className="card-header bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center">
              <PieChartIcon className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-900">Confidence Level Distribution</h3>
            </div>
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
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: string) => [value, 'Responses']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: '#f9fafb', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-secondary-500">
                <div className="text-center">
                  <PieChartIcon className="w-12 h-12 text-secondary-300 mx-auto mb-2" />
                  <p>No confidence level data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Department Performance */}
        <div className="card border-l-4 border-l-green-500">
          <div className="card-header bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-900">Department Performance</h3>
            </div>
          </div>
          <div className="card-content">
            {departmentPerformance.length > 0 ? (
              <div className="space-y-4">
                {departmentPerformance.slice(0, 5).map((dept, index) => (
                  <div key={dept.department} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        dept.performance === 'Excellent' ? 'bg-green-500' :
                        dept.performance === 'Good' ? 'bg-blue-500' :
                        dept.performance === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {dept.department.length > 25 ? dept.department.substring(0, 25) + '...' : dept.department}
                        </p>
                        <p className="text-xs text-gray-500">{dept.responses} responses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-gray-900">{dept.averageAwareness}/5</p>
                      <p className={`text-xs font-medium ${
                        dept.performance === 'Excellent' ? 'text-green-600' :
                        dept.performance === 'Good' ? 'text-blue-600' :
                        dept.performance === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                      }`}>{dept.performance}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-secondary-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-secondary-300 mx-auto mb-2" />
                  <p>No department data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Policy Priority Analysis */}
      {policyPriorityChartData.length > 0 && (
        <div className="card border-l-4 border-l-purple-500">
          <div className="card-header bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="flex items-center">
              <Award className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-purple-900">Most Prioritized Policies for Training</h3>
            </div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={policyPriorityChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 'dataMax']} tick={{ fontSize: 12 }} />
                <YAxis dataKey="policy" type="category" width={200} tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: any, name: string) => [value, 'Prioritizations']}
                  labelFormatter={(label: string) => `Policy: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#f9fafb', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Confidence vs Awareness Correlation */}
      {confidenceAwarenessData.length > 0 && (
        <div className="card border-l-4 border-l-teal-500">
          <div className="card-header bg-gradient-to-r from-teal-50 to-teal-100">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-teal-600 mr-2" />
              <h3 className="text-lg font-semibold text-teal-900">Confidence vs Awareness Correlation</h3>
            </div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={confidenceAwarenessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  dataKey="confidence" 
                  name="Confidence Level"
                  domain={[0, 5]}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="awareness" 
                  name="Awareness Score"
                  domain={[0, 5]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value: any, name: string) => [value, name === 'confidence' ? 'Confidence' : 'Awareness']}
                  labelFormatter={(label: string, payload: any) => 
                    payload && payload[0] ? `Department: ${payload[0].payload.department}` : ''
                  }
                  contentStyle={{ 
                    backgroundColor: '#f9fafb', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Scatter dataKey="awareness" fill={COLORS.teal} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Enhanced Awareness Scores */}
      <div className="card border-l-4 border-l-emerald-500">
        <div className="card-header bg-gradient-to-r from-emerald-50 to-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-emerald-600 mr-2" />
              <h3 className="text-lg font-semibold text-emerald-900">Average Awareness Scores by Policy</h3>
            </div>
            <div className="text-sm text-emerald-700">
              Scale: 1 (Not aware) → 5 (Fully understand & can apply)
            </div>
          </div>
        </div>
        <div className="card-content">
          {enhancedAwarenessChartData.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={enhancedAwarenessChartData} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    domain={[0, 5]} 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}/5`}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={200} 
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      `${value.toFixed(2)}/5 (${((value/5)*100).toFixed(1)}%)`, 
                      'Average Score'
                    ]}
                    labelFormatter={(label: string) => `Policy: ${label}`}
                    contentStyle={{ 
                      backgroundColor: '#f9fafb', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                  />
                  <Bar 
                    dataKey="average" 
                    fill={(entry: any) => entry.color}
                    radius={[0, 4, 4, 0]}
                  >
                    {enhancedAwarenessChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Performance Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Excellent (4.0+)</p>
                      <p className="text-lg font-bold text-green-900">
                        {enhancedAwarenessChartData.filter(item => item.average >= 4).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Good (3.0-3.9)</p>
                      <p className="text-lg font-bold text-blue-900">
                        {enhancedAwarenessChartData.filter(item => item.average >= 3 && item.average < 4).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Fair (2.0-2.9)</p>
                      <p className="text-lg font-bold text-yellow-900">
                        {enhancedAwarenessChartData.filter(item => item.average >= 2 && item.average < 3).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <div>
                      <p className="text-sm font-medium text-red-800">Needs Improvement (<2.0)</p>
                      <p className="text-lg font-bold text-red-900">
                        {enhancedAwarenessChartData.filter(item => item.average < 2).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-secondary-500">
              <div className="text-center">
                <Target className="w-12 h-12 text-secondary-300 mx-auto mb-2" />
                <p>No awareness data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Insights and Recommendations */}
      <div className="card border-l-4 border-l-indigo-500">
        <div className="card-header bg-gradient-to-r from-indigo-50 to-indigo-100">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-indigo-900">Key Insights & Recommendations</h3>
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Policies */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Award className="w-4 h-4 text-green-600 mr-2" />
                Top Performing Policies
              </h4>
              <div className="space-y-2">
                {enhancedAwarenessChartData
                  .filter(item => item.average >= 4)
                  .slice(0, 3)
                  .map((policy, index) => (
                    <div key={policy.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="font-medium text-green-900">{policy.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{policy.average.toFixed(1)}/5</span>
                    </div>
                  ))}
                {enhancedAwarenessChartData.filter(item => item.average >= 4).length === 0 && (
                  <p className="text-gray-500 text-sm italic">No policies currently performing at excellent level (4.0+)</p>
                )}
              </div>
            </div>

            {/* Policies Needing Attention */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                Policies Needing Attention
              </h4>
              <div className="space-y-2">
                {enhancedAwarenessChartData
                  .filter(item => item.average < 3)
                  .slice(0, 3)
                  .map((policy, index) => (
                    <div key={policy.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="font-medium text-red-900">{policy.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-red-700">{policy.average.toFixed(1)}/5</span>
                    </div>
                  ))}
                {enhancedAwarenessChartData.filter(item => item.average < 3).length === 0 && (
                  <p className="text-gray-500 text-sm italic">All policies are performing well (3.0+)</p>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Target className="w-4 h-4 text-blue-600 mr-2" />
              Recommended Actions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-blue-800">Training Priorities:</p>
                <ul className="space-y-1 text-blue-700">
                  {policyPriorityChartData.slice(0, 3).map((policy, index) => (
                    <li key={policy.fullPolicy} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {policy.fullPolicy} ({policy.percentage}% priority)
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-blue-800">Department Focus:</p>
                <ul className="space-y-1 text-blue-700">
                  {departmentPerformance
                    .filter(dept => dept.performance === 'Needs Improvement' || dept.performance === 'Fair')
                    .slice(0, 3)
                    .map((dept, index) => (
                      <li key={dept.department} className="flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        {dept.department} ({dept.averageAwareness}/5)
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
