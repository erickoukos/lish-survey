import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, ArrowUp, ArrowDown, Settings, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Question {
  id: string
  section: string
  questionType: 'text' | 'select' | 'multiselect' | 'rating' | 'boolean'
  questionText: string
  questionNumber: number
  isRequired: boolean
  options?: string[]
  validationRules?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
  placeholder?: string
  helpText?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Section {
  id: string
  sectionKey: string
  title: string
  description?: string
  order: number
  isActive: boolean
  questions?: Question[]
}

const QuestionManager: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [isEditingQuestion, setIsEditingQuestion] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    section: '',
    questionType: 'text',
    questionText: '',
    questionNumber: 1,
    isRequired: true,
    isActive: true
  })
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question>>({})

  const queryClient = useQueryClient()

  // Fetch sections
  const { data: sectionsData, isLoading: sectionsLoading, error: sectionsError } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const response = await fetch('/api/sections')
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    }
  })

  // Fetch questions for selected section
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', selectedSection],
    queryFn: async () => {
      const response = await fetch(`/api/questions?section=${selectedSection}`)
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    },
    enabled: !!selectedSection
  })

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (question: Partial<Question>) => {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question)
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      setIsAddingQuestion(false)
      setNewQuestion({
        section: selectedSection,
        questionType: 'text',
        questionText: '',
        questionNumber: 1,
        isRequired: true,
        isActive: true
      })
      toast.success('Question created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create question')
    }
  })

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, ...question }: Partial<Question> & { id: string }) => {
      const response = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...question })
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      setIsEditingQuestion(null)
      setEditingQuestion({})
      toast.success('Question updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update question')
    }
  })

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/questions?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      toast.success('Question deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete question')
    }
  })

  const handleAddQuestion = () => {
    if (!selectedSection) {
      toast.error('Please select a section first')
      return
    }
    setNewQuestion(prev => ({ ...prev, section: selectedSection }))
    setIsAddingQuestion(true)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setIsEditingQuestion(question.id)
  }

  const handleSaveQuestion = () => {
    if (isAddingQuestion) {
      createQuestionMutation.mutate(newQuestion)
    } else if (isEditingQuestion) {
      updateQuestionMutation.mutate({ id: isEditingQuestion, ...editingQuestion })
    }
  }

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestionMutation.mutate(id)
    }
  }

  const handleCancel = () => {
    setIsAddingQuestion(false)
    setIsEditingQuestion(null)
    setNewQuestion({
      section: selectedSection,
      questionType: 'text',
      questionText: '',
      questionNumber: 1,
      isRequired: true,
      isActive: true
    })
    setEditingQuestion({})
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />
      case 'select': return <CheckCircle className="w-4 h-4" />
      case 'multiselect': return <CheckCircle className="w-4 h-4" />
      case 'rating': return <AlertCircle className="w-4 h-4" />
      case 'boolean': return <CheckCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800'
      case 'select': return 'bg-green-100 text-green-800'
      case 'multiselect': return 'bg-purple-100 text-purple-800'
      case 'rating': return 'bg-yellow-100 text-yellow-800'
      case 'boolean': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (sectionsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 text-lg">Loading question manager...</p>
        </div>
      </div>
    )
  }

  if (sectionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Database Setup Required</h3>
            <p className="text-gray-600 mb-4">
              The question management system requires database tables to be created first.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-yellow-800 mb-2">To fix this issue:</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Run: <code className="bg-yellow-100 px-1 rounded">npx prisma migrate dev --name add_question_management</code></li>
                <li>2. Or run: <code className="bg-yellow-100 px-1 rounded">npx prisma db push</code></li>
                <li>3. Refresh this page</li>
              </ol>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Question Manager
                </h1>
                <p className="text-sm text-gray-600">Manage survey questions and sections</p>
              </div>
            </div>
            
            <button
              onClick={handleAddQuestion}
              disabled={!selectedSection}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sections Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
              <div className="space-y-2">
                {sectionsData?.map((section: Section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.sectionKey)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      selectedSection === section.sectionKey
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{section.title}</p>
                        <p className="text-xs opacity-75">{section.sectionKey}</p>
                      </div>
                      {section.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedSection ? `Questions for Section ${selectedSection}` : 'Select a Section'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {questionsData?.length || 0} questions
                  </p>
                </div>
              </div>

              {!selectedSection ? (
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Please select a section to view questions</p>
                </div>
              ) : questionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {questionsData?.map((question: Question) => (
                    <div
                      key={question.id}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-2 rounded-lg ${getQuestionTypeColor(question.questionType)}`}>
                              {getQuestionTypeIcon(question.questionType)}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">
                                Q{question.questionNumber}
                              </span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                question.isRequired 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {question.isRequired ? 'Required' : 'Optional'}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-900 font-medium mb-2">{question.questionText}</p>
                          {question.helpText && (
                            <p className="text-sm text-gray-600 mb-2">{question.helpText}</p>
                          )}
                          {question.options && question.options.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Options:</span> {question.options.join(', ')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Edit Question"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {questionsData?.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No questions found for this section</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Question Modal */}
        {(isAddingQuestion || isEditingQuestion) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {isAddingQuestion ? 'Add New Question' : 'Edit Question'}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Question Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={isAddingQuestion ? newQuestion.questionType : editingQuestion.questionType}
                      onChange={(e) => {
                        if (isAddingQuestion) {
                          setNewQuestion(prev => ({ ...prev, questionType: e.target.value as any }))
                        } else {
                          setEditingQuestion(prev => ({ ...prev, questionType: e.target.value as any }))
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="text">Text Input</option>
                      <option value="select">Single Select</option>
                      <option value="multiselect">Multiple Select</option>
                      <option value="rating">Rating Scale</option>
                      <option value="boolean">Yes/No</option>
                    </select>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={isAddingQuestion ? newQuestion.questionText : editingQuestion.questionText}
                      onChange={(e) => {
                        if (isAddingQuestion) {
                          setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))
                        } else {
                          setEditingQuestion(prev => ({ ...prev, questionText: e.target.value }))
                        }
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your question here..."
                    />
                  </div>

                  {/* Question Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={isAddingQuestion ? newQuestion.questionNumber : editingQuestion.questionNumber}
                      onChange={(e) => {
                        if (isAddingQuestion) {
                          setNewQuestion(prev => ({ ...prev, questionNumber: parseInt(e.target.value) || 1 }))
                        } else {
                          setEditingQuestion(prev => ({ ...prev, questionNumber: parseInt(e.target.value) || 1 }))
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Options for select/multiselect */}
                  {((isAddingQuestion ? newQuestion.questionType : editingQuestion.questionType) === 'select' || 
                    (isAddingQuestion ? newQuestion.questionType : editingQuestion.questionType) === 'multiselect') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options (one per line)
                      </label>
                      <textarea
                        value={((isAddingQuestion ? newQuestion.options : editingQuestion.options) || []).join('\n')}
                        onChange={(e) => {
                          const options = e.target.value.split('\n').filter(opt => opt.trim())
                          if (isAddingQuestion) {
                            setNewQuestion(prev => ({ ...prev, options }))
                          } else {
                            setEditingQuestion(prev => ({ ...prev, options }))
                          }
                        }}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}

                  {/* Help Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Help Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={isAddingQuestion ? newQuestion.helpText || '' : editingQuestion.helpText || ''}
                      onChange={(e) => {
                        if (isAddingQuestion) {
                          setNewQuestion(prev => ({ ...prev, helpText: e.target.value }))
                        } else {
                          setEditingQuestion(prev => ({ ...prev, helpText: e.target.value }))
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Additional guidance for respondents..."
                    />
                  </div>

                  {/* Required */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isRequired"
                      checked={isAddingQuestion ? newQuestion.isRequired : editingQuestion.isRequired}
                      onChange={(e) => {
                        if (isAddingQuestion) {
                          setNewQuestion(prev => ({ ...prev, isRequired: e.target.checked }))
                        } else {
                          setEditingQuestion(prev => ({ ...prev, isRequired: e.target.checked }))
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
                      This question is required
                    </label>
                  </div>

                  {/* Active */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isAddingQuestion ? newQuestion.isActive : editingQuestion.isActive}
                      onChange={(e) => {
                        if (isAddingQuestion) {
                          setNewQuestion(prev => ({ ...prev, isActive: e.target.checked }))
                        } else {
                          setEditingQuestion(prev => ({ ...prev, isActive: e.target.checked }))
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      This question is active
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveQuestion}
                    disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {createQuestionMutation.isPending || updateQuestionMutation.isPending 
                        ? 'Saving...' 
                        : 'Save Question'
                      }
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionManager
