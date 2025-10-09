import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Copy,
  ArrowUp,
  ArrowDown,
  Settings,
  FileText,
  BarChart3
} from 'lucide-react'

interface Question {
  id: string
  section: string
  questionType: string
  questionText: string
  questionNumber: number
  isRequired: boolean
  options?: string[]
  validationRules?: any
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
  questions: Question[]
}

const EnhancedQuestionManager: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('A')
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question>>({})
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [showSectionForm, setShowSectionForm] = useState(false)
  const [editingSection, setEditingSection] = useState<Partial<Section>>({})
  const [selectedSurveySet, setSelectedSurveySet] = useState<string>('')

  const queryClient = useQueryClient()

  // Fetch survey sets
  const { data: surveySetsData } = useQuery({
    queryKey: ['surveySets'],
    queryFn: async () => {
      const response = await fetch('/api/survey-sets')
      if (!response.ok) throw new Error('Failed to fetch survey sets')
      return response.json()
    }
  })

  // Initialize selectedSurveySet from localStorage
  useEffect(() => {
    const storedSurveySetId = localStorage.getItem('selectedSurveySetId')
    if (storedSurveySetId) {
      setSelectedSurveySet(storedSurveySetId)
    } else if (surveySetsData?.data?.length > 0) {
      // Default to first survey set if none selected
      setSelectedSurveySet(surveySetsData.data[0].id)
    }
  }, [surveySetsData])

  // Fetch sections for selected survey set
  const { data: sectionsData, isLoading: sectionsLoading } = useQuery({
    queryKey: ['sections', selectedSurveySet],
    queryFn: async () => {
      const response = await fetch(`/api/sections?surveySetId=${selectedSurveySet}`)
      if (!response.ok) throw new Error('Failed to fetch sections')
      return response.json()
    },
    enabled: !!selectedSurveySet
  })

  // Fetch questions for selected section
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', selectedSection, selectedSurveySet],
    queryFn: async () => {
      const response = await fetch(`/api/questions?section=${selectedSection}&surveySetId=${selectedSurveySet}`)
      if (!response.ok) throw new Error('Failed to fetch questions')
      return response.json()
    },
    enabled: !!selectedSection && !!selectedSurveySet
  })

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...data,
          surveySetId: selectedSurveySet
        })
      })
      if (!response.ok) throw new Error('Failed to create question')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      setShowQuestionForm(false)
      setEditingQuestion({})
      toast.success('Question created successfully!')
    },
    onError: () => {
      toast.error('Failed to create question')
    }
  })

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await fetch('/api/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id, ...data })
      })
      if (!response.ok) throw new Error('Failed to update question')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      setEditingQuestion({})
      toast.success('Question updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update question')
    }
  })

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/questions?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Failed to delete question')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      toast.success('Question deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete question')
    }
  })

  // Set default survey set when data loads
  useEffect(() => {
    if (surveySetsData?.data?.length > 0 && !selectedSurveySet) {
      setSelectedSurveySet(surveySetsData.data[0].id)
    }
  }, [surveySetsData, selectedSurveySet])

  const handleCreateQuestion = () => {
    setEditingQuestion({
      section: selectedSection,
      questionType: 'text',
      questionText: '',
      questionNumber: (questionsData?.data?.length || 0) + 1,
      isRequired: true,
      isActive: true
    })
    setShowQuestionForm(true)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setShowQuestionForm(true)
  }

  const handleSaveQuestion = () => {
    if (!editingQuestion.questionText?.trim()) {
      toast.error('Question text is required')
      return
    }

    if (editingQuestion.id) {
      updateQuestionMutation.mutate(editingQuestion)
    } else {
      createQuestionMutation.mutate(editingQuestion)
    }
  }

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestionMutation.mutate(id)
    }
  }

  const handleDuplicateQuestion = (question: Question) => {
    const duplicatedQuestion = {
      ...question,
      id: undefined,
      questionText: `${question.questionText} (Copy)`,
      questionNumber: (questionsData?.data?.length || 0) + 1
    }
    setEditingQuestion(duplicatedQuestion)
    setShowQuestionForm(true)
  }

  const surveySets = surveySetsData?.data || []
  const sections: Section[] = sectionsData?.data || []
  const questions: Question[] = questionsData?.data || []

  if (!selectedSurveySet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading survey sets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Question Manager</h1>
          <p className="text-gray-600">Manage questions and sections for your survey sets.</p>
        </div>

        {/* Survey Set Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Survey Set</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {surveySets.map((set: any) => (
              <div
                key={set.id}
                onClick={() => setSelectedSurveySet(set.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedSurveySet === set.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{set.name}</h3>
                <p className="text-sm text-gray-600">{set.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {set._count?.responses || 0} responses • {set._count?.questions || 0} questions
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sections Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Sections</h2>
                <button
                  onClick={() => setShowSectionForm(true)}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    onClick={() => setSelectedSection(section.sectionKey)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSection === section.sectionKey
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                        <p className="text-xs text-gray-500">
                          {section.questions?.length || 0} questions
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingSection(section)
                            setShowSectionForm(true)
                          }}
                          className="p-1 text-gray-600 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Questions Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Questions for Section {selectedSection}
                </h2>
                <button
                  onClick={handleCreateQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              {questionsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">
                              Q{question.questionNumber}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {question.questionType}
                            </span>
                            {question.isRequired && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                                Required
                              </span>
                            )}
                            {!question.isActive && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-gray-900 mb-2">{question.questionText}</p>
                          {question.helpText && (
                            <p className="text-sm text-gray-600">{question.helpText}</p>
                          )}
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Options:</p>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {question.options.map((option, idx) => (
                                  <li key={idx}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                            title="Edit question"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateQuestion(question)}
                            className="p-2 text-gray-600 hover:text-green-600"
                            title="Duplicate question"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 text-gray-600 hover:text-red-600"
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {questions.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No questions in this section yet.</p>
                      <button
                        onClick={handleCreateQuestion}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add First Question
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question Form Modal */}
        {showQuestionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingQuestion.id ? 'Edit Question' : 'Create Question'}
                </h3>
                <button
                  onClick={() => {
                    setShowQuestionForm(false)
                    setEditingQuestion({})
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveQuestion(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={editingQuestion.questionText || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type *
                    </label>
                    <select
                      value={editingQuestion.questionType || 'text'}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, questionType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="text">Text</option>
                      <option value="select">Single Select</option>
                      <option value="multiselect">Multiple Select</option>
                      <option value="rating">Rating</option>
                      <option value="boolean">Yes/No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Number *
                    </label>
                    <input
                      type="number"
                      value={editingQuestion.questionNumber || 1}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, questionNumber: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {(editingQuestion.questionType === 'select' || editingQuestion.questionType === 'multiselect') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options (one per line)
                    </label>
                    <textarea
                      value={editingQuestion.options?.join('\n') || ''}
                      onChange={(e) => setEditingQuestion({ 
                        ...editingQuestion, 
                        options: e.target.value.split('\n').filter(opt => opt.trim()) 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Help Text
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.helpText || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, helpText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional guidance for respondents"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.placeholder || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, placeholder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Placeholder text for input fields"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingQuestion.isRequired || false}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, isRequired: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Required</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingQuestion.isActive !== false}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createQuestionMutation.isPending || updateQuestionMutation.isPending ? 'Saving...' : 'Save Question'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false)
                      setEditingQuestion({})
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedQuestionManager
