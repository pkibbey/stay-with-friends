'use client'

import React from 'react'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  headerActions?: React.ReactNode
  className?: string
  showHeader?: boolean
}

export function PageLayout({ 
  children, 
  title, 
  subtitle, 
  headerActions, 
  className = '',
  showHeader = true 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      {showHeader && (title || headerActions) && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              {(title || subtitle) && (
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  )}
                  {subtitle && (
                    <p className="text-gray-600 mt-1">{subtitle}</p>
                  )}
                </div>
              )}
              
              {headerActions && (
                <div className="flex items-center gap-3">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`container mx-auto px-4 py-6 ${className}`}>
        {children}
      </div>
    </div>
  )
}