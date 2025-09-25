import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary-900 text-white py-6 sm:py-8 mt-12 sm:mt-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">LISH AI LABS</h3>
            <p className="text-secondary-300 text-xs sm:text-sm">
              Leading the future of artificial intelligence and policy development.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Survey</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-secondary-300">
              <li>Policy Awareness</li>
              <li>Training Needs</li>
              <li>Professional Development</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Contact</h4>
            <p className="text-secondary-300 text-xs sm:text-sm">
              For questions about this survey, please contact your HR department.
            </p>
          </div>
        </div>
        
        <div className="border-t border-secondary-700 mt-6 sm:mt-8 pt-4 sm:pt-8 text-center">
          <p className="text-secondary-400 text-xs sm:text-sm">
            © {new Date().getFullYear()} LISH AI LABS. All rights reserved.
          </p>
          <p className="text-secondary-500 text-xs mt-1 sm:mt-2">
            Created with ❤️ by Erick Ouko N., CTO - LISH AI LABS
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
