import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi, surveyApi } from '../../lib/api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, ScatterChart, Scatter, RadialBarChart, RadialBar, ComposedChart, Legend } from 'recharts'
import { Users, TrendingUp, Target, CheckCircle, AlertTriangle, Award, BarChart3, PieChart as PieChartIcon, Activity, Zap, Brain, Shield, Star, Globe, Clock, Filter, Download, RefreshCw, Eye, EyeOff } from 'lucide-react'

const AnalyticsDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparative'>('overview')
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)

  const { data: responsesData, isLoading, refetch } = useQuery({
    queryKey: ['responses', { page: 1, limit: 1000 }],
    queryFn: () => adminApi.getResponses({ page: 1, limit: 1000 })
  })

  const { data: surveyConfig } = useQuery({
    queryKey: ['survey-config'],
    queryFn: () => surveyApi.getSurveyConfig()
  })

  const responses = responsesData?.data || []

  // Advanced data processing with filtering
  const processedData = useMemo(() => {
    if (!responses.length) return { filteredResponses: [], departments: [], timeframes: {} }

    // Filter by timeframe
    const now = new Date()
    const filteredByTime = responses.filter(response => {
      const responseDate = new Date(response.createdAt)
      switch (selectedTimeframe) {
        case '7d':
          return responseDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case '30d':
          return responseDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        case '90d':
          return responseDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        default:
          return true
      }
    })

    // Filter by department
    const filteredResponses = selectedDepartment === 'all' 
      ? filteredByTime 
      : filteredByTime.filter(response => response.department === selectedDepartment)

    // Get unique departments
    const departments = [...new Set(responses.map(r => r.department))]

    // Calculate timeframes
    const timeframes = {
      last7Days: responses.filter(r => new Date(r.createdAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length,
      last30Days: responses.filter(r => new Date(r.createdAt) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)).length,
      last90Days: responses.filter(r => new Date(r.createdAt) >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)).length,
      total: responses.length
    }

    return { filteredResponses, departments, timeframes }
  }, [responses, selectedTimeframe, selectedDepartment])

  const { filteredResponses, departments, timeframes } = processedData

  // Process data for charts with comprehensive validation using filtered data
  const confidenceData = filteredResponses.reduce((acc: any, response: any) => {
    const level = response.confidenceLevel
    if (level && typeof level === 'string' && level.trim()) {
      acc[level] = (acc[level] || 0) + 1
    }
    return acc
  }, {})

  const confidenceChartData = (() => {
    const validData = Object.entries(confidenceData)
      .filter(([name, value]) => (value as number) > 0 && !isNaN(value as number))
      .map(([name, value]) => ({
        name,
        value: Math.max(0, value as number)
      }))
    return validData.length > 0 ? validData : [{ name: 'No Data', value: 1 }]
  })()

  const departmentData = filteredResponses.reduce((acc: any, response: any) => {
    const dept = response.department
    if (dept && typeof dept === 'string' && dept.trim()) {
      acc[dept] = (acc[dept] || 0) + 1
    }
    return acc
  }, {})

  const departmentChartData = (() => {
    const validData = Object.entries(departmentData)
      .filter(([name, value]) => (value as number) > 0 && !isNaN(value as number))
      .map(([name, value]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        value: Math.max(0, value as number)
      }))
    return validData.length > 0 ? validData : [{ name: 'No Data', fullName: 'No Data', value: 1 }]
  })()

  const awarenessData = filteredResponses.reduce((acc: any, response: any) => {
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
      .filter(([name, total]) => (total as number) > 0 && !isNaN(total as number))
      .map(([name, total]) => ({
        name: name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        average: Math.max(0, Math.min(5, (total as number) / filteredResponses.length)) // Clamp between 0 and 5
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

  const totalResponses = filteredResponses.length
  const expectedResponses = surveyConfig?.config?.expectedResponses || 100
  const progressPercentage = expectedResponses > 0 ? Math.min((totalResponses / expectedResponses) * 100, 100) : 0
  
  // Advanced metrics calculation
  const advancedMetrics = useMemo(() => {
    if (!filteredResponses.length) return {
      completionRate: 0,
      averageResponseTime: 0,
      engagementScore: 0,
      qualityScore: 0,
      trendDirection: 'stable'
    }

    // Calculate completion rate (responses with all required fields)
    const completedResponses = filteredResponses.filter(r => 
      r.awareness && r.confidenceLevel && r.department
    ).length
    const completionRate = (completedResponses / filteredResponses.length) * 100

    // Calculate engagement score based on detailed responses
    const engagementScore = filteredResponses.reduce((score, r) => {
      let points = 0
      if (r.unsureSituationDescription && r.unsureSituationDescription.length > 50) points += 2
      if (r.generalComments && r.generalComments.length > 50) points += 2
      if (r.prioritizationReason && r.prioritizationReason.length > 50) points += 2
      if (r.complianceSuggestions && r.complianceSuggestions.length > 50) points += 2
      return score + points
    }, 0) / filteredResponses.length

    // Calculate quality score based on awareness levels
    const qualityScore = filteredResponses.reduce((score, r) => {
      try {
        const awareness = typeof r.awareness === 'string' ? JSON.parse(r.awareness) : r.awareness
        const values = Object.values(awareness || {}).filter(v => typeof v === 'number') as number[]
        const avgAwareness = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
        return score + avgAwareness
      } catch {
        return score
      }
    }, 0) / filteredResponses.length

    return {
      completionRate,
      engagementScore,
      qualityScore,
      trendDirection: 'up' // Could be calculated based on historical data
    }
  }, [filteredResponses])
  
  // Enhanced awareness calculation
  const awarenessScores = filteredResponses.map((r: any) => {
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

  const highConfidenceCount = filteredResponses.filter((r: any) => 
    r.confidenceLevel === 'Very confident' || r.confidenceLevel === 'Confident'
  ).length

  const unsureSituationCount = filteredResponses.filter((r: any) => r.facedUnsureSituation).length

  // New analytics metrics
  const lowAwarenessCount = awarenessScores.filter(score => score < 2.5).length
  const highAwarenessCount = awarenessScores.filter(score => score >= 4).length

  // Department performance analysis
  const departmentPerformance = Object.entries(departmentData).map(([dept, count]) => {
    const deptResponses = filteredResponses.filter((r: any) => r.department === dept)
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
      ? deptAwarenessScores.reduce((sum: number, score: number) => sum + score, 0) / deptAwarenessScores.length 
      : 0
    
    return {
      department: dept,
      responses: count,
      averageAwareness: avgAwareness.toFixed(1),
      performance: avgAwareness >= 4 ? 'Excellent' : avgAwareness >= 3 ? 'Good' : avgAwareness >= 2 ? 'Fair' : 'Needs Improvement'
    }
  }).sort((a, b) => parseFloat(b.averageAwareness) - parseFloat(a.averageAwareness))

  // Policy priority analysis
  const policyPriorityData = filteredResponses.reduce((acc: any, response: any) => {
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
  const confidenceAwarenessData = filteredResponses.map((r: any) => {
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
    .filter(([name, total]) => (total as number) > 0 && !isNaN(total as number))
    .map(([name, total]) => {
      const average = Math.max(0, Math.min(5, (total as number) / filteredResponses.length))
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 text-lg">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-600">Comprehensive survey insights and performance metrics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => refetch()}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              </div>
            </div>
          </div>
        </div>

      <div className="p-6 space-y-8">
        {/* Advanced Metrics Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Progress Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{totalResponses}</div>
                <div className="text-blue-100 text-sm">of {expectedResponses} expected</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quality Score */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Star className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{advancedMetrics.qualityScore.toFixed(1)}</div>
                <div className="text-emerald-100 text-sm">Quality Score</div>
              </div>
            </div>
            <div className="text-sm text-emerald-100">
              Average awareness level across all policies
          </div>
        </div>

          {/* Engagement Score */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Brain className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{advancedMetrics.engagementScore.toFixed(1)}</div>
                <div className="text-purple-100 text-sm">Engagement</div>
              </div>
            </div>
            <div className="text-sm text-purple-100">
              Based on detailed responses and comments
          </div>
        </div>

          {/* Completion Rate */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{advancedMetrics.completionRate.toFixed(1)}%</div>
                <div className="text-orange-100 text-sm">Completion</div>
              </div>
            </div>
            <div className="text-sm text-orange-100">
              Responses with complete data
            </div>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Confidence Distribution - Enhanced */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <PieChartIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confidence Distribution</h3>
                  <p className="text-sm text-gray-600">Employee confidence levels</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{totalResponses}</div>
                <div className="text-xs text-gray-500">Total Responses</div>
        </div>
      </div>

            {confidenceChartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={confidenceChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {confidenceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                    <Tooltip 
                      formatter={(value: any, name: string) => [value, 'Responses']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                </PieChart>
              </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                <div className="text-center">
                  <PieChartIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No confidence data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Department Performance - Enhanced */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
                  <p className="text-sm text-gray-600">Awareness scores by department</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {departmentPerformance.slice(0, 5).map((dept, index) => (
                <div key={dept.department} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      dept.performance === 'Excellent' ? 'bg-emerald-500' :
                      dept.performance === 'Good' ? 'bg-blue-500' :
                      dept.performance === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {dept.department.length > 25 ? dept.department.substring(0, 25) + '...' : dept.department}
                      </p>
                      <p className="text-xs text-gray-500">{dept.responses as number} responses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{dept.averageAwareness}/5</p>
                    <p className={`text-xs font-medium ${
                      dept.performance === 'Excellent' ? 'text-emerald-600' :
                      dept.performance === 'Good' ? 'text-blue-600' :
                      dept.performance === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                    }`}>{dept.performance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Awareness Scores - Enhanced */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Policy Awareness Scores</h3>
                  <p className="text-sm text-gray-600">Average awareness by policy</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Scale: 1 (Not aware) → 5 (Fully understand)
              </div>
            </div>
            
            {enhancedAwarenessChartData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
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
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="average" 
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                    >
                      {enhancedAwarenessChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No awareness data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Confidence vs Awareness Correlation */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confidence vs Awareness</h3>
                  <p className="text-sm text-gray-600">Correlation analysis</p>
                </div>
              </div>
            </div>
            
            {confidenceAwarenessData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
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
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Scatter dataKey="awareness" fill="#14b8a6" />
                  </ScatterChart>
              </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No correlation data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Insights Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Key Insights & Recommendations</h3>
                <p className="text-sm text-gray-600">AI-powered insights and actionable recommendations</p>
          </div>
        </div>
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Policies */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Award className="w-4 h-4 text-emerald-600 mr-2" />
                Top Performing Policies
              </h4>
              <div className="space-y-3">
                {enhancedAwarenessChartData
                  .filter(item => item.average >= 4)
                  .slice(0, 3)
                  .map((policy, index) => (
                    <div key={policy.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-emerald-900">{policy.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-700">{policy.average.toFixed(1)}/5</span>
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
              <div className="space-y-3">
                {enhancedAwarenessChartData
                  .filter(item => item.average < 3)
                  .slice(0, 3)
                  .map((policy, index) => (
                    <div key={policy.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
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
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard