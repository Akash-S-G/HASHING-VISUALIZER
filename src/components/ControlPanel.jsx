import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { HashFunctionSelector } from './HashFunctionSelector'
import { CollisionResolutionSelector } from './CollisionResolutionSelector'
import { CustomHashEditor } from './CustomHashEditor'

export function ControlPanel({
  onInsert,
  onDelete,
  onSearch,
  isAnimating,
  onTableSizeChange,
  tableSize,
  hashFunctions,
  selectedHashFunction,
  onSelectHashFunction,
  collisionResolutions,
  selectedCollisionResolution,
  onSelectCollisionResolution,
  customHashEditor,
}) {
  const [key, setKey] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const numKey = parseInt(key)
    if (!isNaN(numKey)) {
      onInsert(numKey)
      setKey('')
    }
  }

  const handleRandomInsert = () => {
    const randomKey = Math.floor(Math.random() * 1000) // Random number between 0-999
    onInsert(randomKey)
  }

  return (
    <div className="card space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Control Panel
      </h2>

      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1">
          <HashFunctionSelector
            functions={hashFunctions}
            selected={selectedHashFunction}
            onSelect={onSelectHashFunction}
          />
          {selectedHashFunction.id === 'custom' && customHashEditor}
        </div>

        <div className="flex-1">
          <CollisionResolutionSelector
            methods={collisionResolutions}
            selected={selectedCollisionResolution}
            onSelect={onSelectCollisionResolution}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="key"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Key
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="key"
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Enter a number"
                disabled={isAnimating}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="tableSize"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Table Size
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="tableSize"
                id="tableSize"
                value={tableSize}
                onChange={(e) => onTableSizeChange(parseInt(e.target.value) || 10)}
                min="1"
                max="1000"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                disabled={isAnimating}
              />
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <motion.button
            type="submit"
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isAnimating}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Insert
          </motion.button>
          <motion.button
            type="button"
            onClick={handleRandomInsert}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isAnimating}
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            Random
          </motion.button>
          <motion.button
            type="button"
            onClick={() => {
              const numKey = parseInt(key)
              if (!isNaN(numKey)) {
                onDelete(numKey)
                setKey('')
              }
            }}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isAnimating}
          >
            <MinusIcon className="h-5 w-5 mr-2" />
            Delete
          </motion.button>
          <motion.button
            type="button"
            onClick={() => {
              const numKey = parseInt(key)
              if (!isNaN(numKey)) {
                onSearch(numKey)
                setKey('')
              }
            }}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isAnimating}
          >
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
            Search
          </motion.button>
        </div>
      </form>
      {isAnimating && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Animation in progress...
        </div>
      )}
    </div>
  )
} 