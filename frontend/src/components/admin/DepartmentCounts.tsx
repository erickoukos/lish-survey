import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Users, TrendingUp, Edit3, Save, X, Plus, Trash2, BarChart3, Target, CheckCircle, AlertCircle, Building, UserCheck, Calculator } from 'lucide-react'
import toast from 'react-hot-toast'

interface DepartmentCount {
  id: string
  department: string
  staffCount: number
  isActive: boolean
  responseCount?: number
  remainingCount?: number
  responseRate?: number
}

interface DepartmentCountsResponse {
  success: boolean
  data: DepartmentCount[]
  totalExpected: number
  totalResponses: number
  totalRemaining: number
  overallResponseRate: number
  count: number
}

const DepartmentCounts: React.FC = () => {
  const [departments, setDepartments] = useState<Omit<DepartmentCount, 'id' | 'isActive'>[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [showQuickSetup, setShowQuickSetup] = useState(false)
  const queryClient = useQueryClient()

  // Default workforce data from your organization
  const defaultWorkforceData = [
    { department: 'Security', staffCount: 2 },
    { department: 'Technical Team', staffCount: 54 },
    { department: 'Project Management', staffCount: 1 },
    { department: 'Data Annotation', staffCount: 70 },
    { department: 'Digital Marketing', staffCount: 5 },
    { department: 'Human Resource Management', staffCount: 3 },
    { department: 'HODs', staffCount: 7 },
    { department: 'Finance and Accounting', staffCount: 1 },
    { department: 'Sanitation Team', staffCount: 2 }
  ]

  // Fetch department counts
  const { data: departmentData, isLoading, error } = useQuery<DepartmentCountsResponse>({
    queryKey: ['departmentCounts'],
    queryFn: async () => {
      const response = await fetch('/api/department-counts')
      if (!response.ok) {
        throw new Error('Failed to fetch department counts')
      }
      return response.json()
    }
  })

  // Update departments state when data changes
  useEffect(() => {
    if (departmentData?.data && departmentData.data.length > 0) {
      setDepartments(departmentData.data.map(dept => ({
        department: dept.department,
        staffCount: dept.staffCount
      })))
    }
  }, [departmentData])

  // Save department counts mutation
  const saveMutation = useMutation({
    mutationFn: async (deptData: Omit<DepartmentCount, 'id' | 'isActive'>[]) => {
      const response = await fetch('/api/department-counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ departments: deptData })
      })
      if (!response.ok) {
        throw new Error('Failed to save department counts')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmentCounts'] })
      queryClient.invalidateQueries({ queryKey: ['surveyConfig'] })
      setIsEditing(false)
      toast.success('Department counts saved successfully!')
    },
    onError: () => {
      toast.error('Failed to save department counts')
    }
  })

  const handleAddDepartment = () => {
    setDepartments([...departments, { department: '', staffCount: 0 }])
  }

  const handleRemoveDepartment = (index: number) => {
    const deptToRemove = departments[index]
    if (deptToRemove.department) {
      toast.success(`Removed ${deptToRemove.department} department`)
    }
    setDepartments(departments.filter((_, i) => i !== index))
  }

  const handleDepartmentChange = (index: number, field: 'department' | 'staffCount', value: string | number) => {
    const updated = [...departments]
    updated[index] = { ...updated[index], [field]: value }
    setDepartments(updated)
  }

  const handleSave = () => {
    const validDepartments = departments.filter(dept => dept.department.trim() && dept.staffCount >= 0)
    if (validDepartments.length === 0) {
      toast.error('Please add at least one department with a valid name and staff count.')
      return
    }
    saveMutation.mutate(validDepartments)
  }

  const handleQuickSetup = () => {
    setDepartments(defaultWorkforceData)
    setIsEditing(true)
    setShowQuickSetup(false)
    toast.success('Default workforce structure loaded!')
  }

  const handleReset = () => {
    setDepartments([])
    setIsEditing(false)
    setShowQuickSetup(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading department data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">Failed to load department counts</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalExpected = departments.reduce((sum, dept) => sum + dept.staffCount, 0)
  const departmentCount = departments.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Department Management
                </h1>
                <p className="text-sm text-gray-600">Manage staff counts and expected survey responses</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Counts</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saveMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Total Expected Responses */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{departmentData?.totalExpected || totalExpected}</div>
                <div className="text-blue-100 text-sm">Expected Responses</div>
              </div>
            </div>
            <div className="text-sm text-blue-100">
              Based on current department staff counts
            </div>
          </div>

          {/* Total Responses Received */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{departmentData?.totalResponses || 0}</div>
                <div className="text-green-100 text-sm">Responses Received</div>
              </div>
            </div>
            <div className="text-sm text-green-100">
              {departmentData?.overallResponseRate || 0}% response rate
            </div>
          </div>

          {/* Remaining Responses */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{departmentData?.totalRemaining || 0}</div>
                <div className="text-orange-100 text-sm">Remaining</div>
              </div>
            </div>
            <div className="text-sm text-orange-100">
              Still need to respond
            </div>
          </div>

          {/* Department Count */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Building className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{departmentCount}</div>
                <div className="text-emerald-100 text-sm">Departments</div>
              </div>
            </div>
            <div className="text-sm text-emerald-100">
              Active departments in organization
            </div>
          </div>
        </div>

        {/* Department Counts Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Department Staff Counts</h3>
                <p className="text-sm text-gray-600">Manage staff counts for each department</p>
              </div>
            </div>
            
            {isEditing && (
              <button
                onClick={handleAddDepartment}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Department</span>
              </button>
            )}
          </div>

          {departments.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Departments Configured</h3>
              <p className="text-gray-600 mb-6">Add departments to start tracking staff counts and expected responses</p>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                >
                  Add First Department
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Staff Count
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Responses
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Response Rate
                    </th>
                    {isEditing && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {departments.map((dept, index) => {
                    const percentage = totalExpected > 0 ? ((dept.staffCount / totalExpected) * 100).toFixed(1) : 0
                    const responseCount = dept.responseCount || 0
                    const remainingCount = dept.remainingCount || dept.staffCount
                    const responseRate = dept.responseRate || 0
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={dept.department}
                              onChange={(e) => handleDepartmentChange(index, 'department', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Department name"
                            />
                          ) : (
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Building className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-gray-900">{dept.department}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={dept.staffCount}
                              onChange={(e) => handleDepartmentChange(index, 'staffCount', parseInt(e.target.value) || 0)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="font-semibold text-gray-900">{dept.staffCount}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <UserCheck className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-semibold text-gray-900">{responseCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Users className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className={`font-semibold ${remainingCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                              {remainingCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  responseRate >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                  responseRate >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                  'bg-gradient-to-r from-red-500 to-red-600'
                                }`}
                                style={{ width: `${Math.min(responseRate, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${
                              responseRate >= 80 ? 'text-green-600' :
                              responseRate >= 50 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {responseRate}%
                            </span>
                          </div>
                        </td>
                        {isEditing && (
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleRemoveDepartment(index)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Remove Department"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Setup Card */}
        {showQuickSetup && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Setup Available</h3>
                <p className="text-blue-700 mb-4">
                  Use the default workforce structure based on your organization's current staff distribution. 
                  This will automatically set up all departments with their respective staff counts.
                </p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleQuickSetup}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Use Default Structure (145 staff)</span>
                  </button>
                  <button
                    onClick={() => setShowQuickSetup(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Analytics */}
        {departments.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Department Analytics</h3>
                <p className="text-sm text-gray-600">Insights into your workforce distribution</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Largest Department */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Largest Department</p>
                    <p className="text-lg font-bold text-green-900">
                      {departments.length > 0 ? departments.reduce((max, dept) => dept.staffCount > max.staffCount ? dept : max).department : 'N/A'}
                    </p>
                    <p className="text-xs text-green-600">
                      {departments.length > 0 ? departments.reduce((max, dept) => dept.staffCount > max.staffCount ? dept : max).staffCount : 0} staff
                    </p>
                  </div>
                </div>
              </div>

              {/* Smallest Department */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Smallest Department</p>
                    <p className="text-lg font-bold text-blue-900">
                      {departments.length > 0 ? departments.reduce((min, dept) => dept.staffCount < min.staffCount ? dept : min).department : 'N/A'}
                    </p>
                    <p className="text-xs text-blue-600">
                      {departments.length > 0 ? departments.reduce((min, dept) => dept.staffCount < min.staffCount ? dept : min).staffCount : 0} staff
                    </p>
                  </div>
                </div>
              </div>

              {/* Overall Response Rate */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-800">Overall Response Rate</p>
                    <p className="text-lg font-bold text-purple-900">{departmentData?.overallResponseRate || 0}%</p>
                    <p className="text-xs text-purple-600">{departmentData?.totalResponses || 0} of {departmentData?.totalExpected || totalExpected} responses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DepartmentCounts