import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'

interface DepartmentCount {
  id: string
  department: string
  staffCount: number
  isActive: boolean
}

interface DepartmentCountsResponse {
  success: boolean
  data: DepartmentCount[]
  totalExpected: number
  count: number
}

const DepartmentCounts: React.FC = () => {
  const [departments, setDepartments] = useState<Omit<DepartmentCount, 'id' | 'isActive'>[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()

  // Fetch department counts
  const { data: departmentData, isLoading, error } = useQuery<DepartmentCountsResponse>({
    queryKey: ['departmentCounts'],
    queryFn: async () => {
      const response = await api.get('/api/department-counts')
      return response.data
    }
  })

  // Update departments state when data changes
  useEffect(() => {
    if (departmentData?.data) {
      setDepartments(departmentData.data.map(dept => ({
        department: dept.department,
        staffCount: dept.staffCount
      })))
    }
  }, [departmentData])

  // Save department counts mutation
  const saveMutation = useMutation({
    mutationFn: async (deptData: Omit<DepartmentCount, 'id' | 'isActive'>[]) => {
      const response = await api.post('/api/department-counts', {
        departments: deptData
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmentCounts'] })
      queryClient.invalidateQueries({ queryKey: ['surveyConfig'] })
      setIsEditing(false)
    }
  })

  // Update single department mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, staffCount }: { id: string; staffCount: number }) => {
      const response = await api.put('/api/department-counts', {
        id,
        staffCount
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmentCounts'] })
      queryClient.invalidateQueries({ queryKey: ['surveyConfig'] })
    }
  })

  // Delete department mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete('/api/department-counts', {
        data: { id }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmentCounts'] })
      queryClient.invalidateQueries({ queryKey: ['surveyConfig'] })
    }
  })

  const handleAddDepartment = () => {
    setDepartments([...departments, { department: '', staffCount: 0 }])
  }

  const handleRemoveDepartment = (index: number) => {
    const deptToRemove = departments[index]
    if (deptToRemove.department) {
      // If it has a department name, it's an existing department - delete it
      const existingDept = departmentData?.data.find(d => d.department === deptToRemove.department)
      if (existingDept) {
        deleteMutation.mutate(existingDept.id)
      }
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
      alert('Please add at least one department with a valid name and staff count.')
      return
    }
    saveMutation.mutate(validDepartments)
  }

  const handleQuickUpdate = (id: string, staffCount: number) => {
    updateMutation.mutate({ id, staffCount })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading department counts: {error.message}</p>
      </div>
    )
  }

  const totalExpected = departments.reduce((sum, dept) => sum + dept.staffCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Department Staff Counts</h2>
          <p className="text-secondary-600 mt-1">
            Manage staff counts for each department to automatically calculate expected survey responses.
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              Edit Counts
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setDepartments(departmentData?.data.map(dept => ({
                    department: dept.department,
                    staffCount: dept.staffCount
                  })) || [])
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="btn-primary"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary-900">Total Expected Responses</h3>
            <p className="text-primary-700">
              Based on current department staff counts
            </p>
          </div>
          <div className="text-3xl font-bold text-primary-600">
            {totalExpected}
          </div>
        </div>
      </div>

      {/* Department Counts Table */}
      <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Department Staff Counts</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Staff Count
                </th>
                {isEditing && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {departments.map((dept, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={dept.department}
                        onChange={(e) => handleDepartmentChange(index, 'department', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Department name"
                      />
                    ) : (
                      <span className="text-sm font-medium text-secondary-900">
                        {dept.department}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={dept.staffCount}
                        onChange={(e) => handleDepartmentChange(index, 'staffCount', parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary-900">
                          {dept.staffCount}
                        </span>
                        <button
                          onClick={() => {
                            const existingDept = departmentData?.data.find(d => d.department === dept.department)
                            if (existingDept) {
                              const newCount = prompt(`Enter new staff count for ${dept.department}:`, dept.staffCount.toString())
                              if (newCount && !isNaN(parseInt(newCount))) {
                                handleQuickUpdate(existingDept.id, parseInt(newCount))
                              }
                            }
                          }}
                          className="text-primary-600 hover:text-primary-800 text-xs"
                        >
                          Quick Edit
                        </button>
                      </div>
                    )}
                  </td>
                  {isEditing && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRemoveDepartment(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isEditing && (
          <div className="px-6 py-4 border-t border-secondary-200">
            <button
              onClick={handleAddDepartment}
              className="btn-secondary"
            >
              + Add Department
            </button>
          </div>
        )}
      </div>

      {/* Default Department Counts */}
      {!isEditing && departments.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Setup</h3>
          <p className="text-blue-700 mb-4">
            Set up department staff counts based on your organization structure. 
            This will automatically calculate the expected number of survey responses.
          </p>
          <button
            onClick={() => {
              // Pre-populate with common departments
              setDepartments([
                { department: 'Security', staffCount: 2 },
                { department: 'Technical Team', staffCount: 54 },
                { department: 'Project Management', staffCount: 1 },
                { department: 'Data Annotation', staffCount: 70 },
                { department: 'Digital Marketing', staffCount: 5 },
                { department: 'Human Resource Management', staffCount: 3 },
                { department: 'HODs', staffCount: 7 },
                { department: 'Finance and Accounting', staffCount: 1 },
                { department: 'Sanitation Team', staffCount: 2 }
              ])
              setIsEditing(true)
            }}
            className="btn-primary"
          >
            Use Default Structure (145 staff)
          </button>
        </div>
      )}
    </div>
  )
}

export default DepartmentCounts
