import React, { useState, useEffect } from 'react'

interface CountdownTimerProps {
  endDate: string
  className?: string
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endDate).getTime()
      const difference = end - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
        setIsExpired(false)
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setIsExpired(true)
      }
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (isExpired) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 text-center ${className}`}>
        <div className="flex items-center justify-center mb-2">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800 font-semibold">Survey has ended</span>
        </div>
        <p className="text-red-600 text-sm">The survey period has closed.</p>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-blue-900">Survey Closes In</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-blue-900">
              {timeLeft.days}
            </div>
            <div className="text-xs sm:text-sm text-blue-600 font-medium">
              {timeLeft.days === 1 ? 'Day' : 'Days'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-blue-900">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm text-blue-600 font-medium">
              {timeLeft.hours === 1 ? 'Hour' : 'Hours'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-blue-900">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm text-blue-600 font-medium">
              {timeLeft.minutes === 1 ? 'Minute' : 'Minutes'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-blue-900">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm text-blue-600 font-medium">
              {timeLeft.seconds === 1 ? 'Second' : 'Seconds'}
            </div>
          </div>
        </div>
        
        <p className="text-blue-700 text-sm mt-3">
          Complete your survey before the deadline
        </p>
      </div>
    </div>
  )
}

export default CountdownTimer
