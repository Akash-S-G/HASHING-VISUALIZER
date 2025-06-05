import { motion } from 'framer-motion'

const credits = [
  {
    category: 'Technologies Used',
    items: [
      { name: 'React', description: 'A JavaScript library for building user interfaces' },
      { name: 'Vite', description: 'Next Generation Frontend Tooling' },
      { name: 'Tailwind CSS', description: 'A utility-first CSS framework' },
      { name: 'Framer Motion', description: 'A production-ready motion library for React' },
      { name: 'D3.js', description: 'Data-Driven Documents for visualization' },
      { name: 'Recharts', description: 'A composable charting library built on React components' },
    ],
  },
  {
    category: 'Resources',
    items: [
      { name: 'Introduction to Algorithms', description: 'By Thomas H. Cormen et al.' },
      { name: 'Data Structures and Algorithms', description: 'By Robert Lafore' },
      { name: 'Hash Tables', description: 'Stanford CS166 Course Materials' },
    ],
  },
  {
    category: 'Special Thanks',
    items: [
      { name: 'Open Source Community', description: 'For the amazing tools and libraries' },
      { name: 'Computer Science Educators', description: 'For their dedication to teaching' },
      { name: 'Algorithm Visualization Community', description: 'For inspiration and best practices' },
    ],
  },
]

export default function Credits() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Credits & Acknowledgments
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          This project was made possible by the following resources and contributions.
        </p>
      </motion.div>

      <div className="space-y-12">
        {credits.map((section, index) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {section.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.items.map((item) => (
                <div
                  key={item.name}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 