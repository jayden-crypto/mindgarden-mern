import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-neutral-100 hover:bg-neutral-200
        dark:bg-neutral-800 dark:hover:bg-neutral-700
        text-neutral-600 dark:text-neutral-300
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-neutral-900
        ${className}
      `}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  )
}

export default ThemeToggle
