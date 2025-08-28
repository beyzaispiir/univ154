import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo with name for univ154.png'
import riceLogo from '../assets/rice-logo.png'

export default function SignUpSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-6 bg-white p-8 rounded-lg shadow-sm px-6">
        {/* Logo and Title Section */}
        <div className="flex flex-col items-center">
          <img 
            src={riceLogo} 
            alt="Rice University Logo" 
            style={{ height: '100px', width: 'auto', marginBottom: '45px' }}
            className="object-contain"
          />
          
          <div className="flex flex-col items-center border-t-2 border-b-2 border-[#0d1a4b] py-4 px-4">
            <div className="flex flex-col items-center" style={{ marginBottom: '-1.5rem' }}>
              <img 
                src={logo} 
                alt="UNIV154 Logo" 
                style={{ height: '140px', width: 'auto', marginLeft: '-10px' }}
                className="object-contain"
              />
            </div>
            
            {/* Course Title Section */}
            <div className="text-center w-full">
              <h1 className="font-bold tracking-wide text-[#0d1a4b] text-left pl-[100px]" style={{ fontSize: '24px', marginTop: '-0.5rem', marginBottom: '0' }}>
                Financial Literacy for Life
              </h1>
              <p className="text-sm tracking-wide text-[#0d1a4b] text-left pl-[100px]" style={{ fontSize: '16px', marginTop: '0' }}>
                Preparing for the Real World
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center space-y-4 mt-8">
          <div className="bg-green-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Registration Successful!
            </h2>
            <p className="text-green-700 text-sm">
              Please check your Rice email for a confirmation link. You'll need to verify your email before signing in.
            </p>
          </div>
          
          <Link
            to="/"
            className="block w-full bg-[#A4907C] text-white px-4 py-2 rounded-md font-semibold
            shadow-sm hover:bg-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#A4907C] 
            focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5
            text-center mt-4"
            style={{ fontSize: '14px' }}
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
} 