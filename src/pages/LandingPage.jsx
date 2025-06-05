import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const features = [
  {
    title: 'Interactive Visualizations',
    description: 'Watch hashing algorithms in action with step-by-step animations and real-time feedback.',
  },
  {
    title: 'Multiple Hashing Techniques',
    description: 'Explore various hashing methods including Division, Multiplication, and Universal Hashing.',
  },
  {
    title: 'Collision Resolution',
    description: 'Learn about different collision handling strategies like Chaining, Linear Probing, and Double Hashing.',
  },
  {
    title: 'Real-World Applications',
    description: 'Discover how hashing is used in databases, cryptography, and blockchain technology.',
  },
]

export default function LandingPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6"
        >
          Master Hashing Techniques
          <br />
          <span className="text-primary-600 dark:text-primary-400">Through Interactive Visualization</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          An educational platform that helps you understand hashing algorithms and collision resolution strategies through interactive visualizations.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/visualizer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Get Started
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
} 