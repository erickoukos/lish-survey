import React from 'react'

interface ProgressBarProps {
  current: number
  total: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = (current / total) * 100

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1 sm:gap-0">
        <span className="text-xs sm:text-sm font-medium text-secondary-700">
          Section {current} of {total}
        </span>
        <span className="text-xs sm:text-sm text-secondary-500">
          {Math.round(percentage)}% Complete
        </span>
      </div>
      
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
