import { motion } from 'framer-motion'

const applications = [
  {
    title: 'Database Indexing',
    description: 'Hash tables are used to create indexes in databases, allowing for fast lookups of records by their keys.',
    example: 'When you search for a user by their ID in a database, a hash function converts the ID into an index where the user data is stored.',
  },
  {
    title: 'Cryptographic Hashing',
    description: 'Hash functions are used in cryptography to create fixed-size digests of data, ensuring data integrity and security.',
    example: 'Password storage uses cryptographic hashing (like SHA-256) to store password hashes instead of plain text.',
  },
  {
    title: 'Caching Systems',
    description: 'Hash tables are used in caching systems to store frequently accessed data for quick retrieval.',
    example: 'Web browsers use hash tables to cache resources like images and scripts, improving page load times.',
  },
  {
    title: 'Blockchain Technology',
    description: 'Hash functions are fundamental to blockchain technology, creating unique identifiers for blocks and ensuring chain integrity.',
    example: 'Bitcoin uses SHA-256 to create block hashes and verify transactions.',
  },
  {
    title: 'File Systems',
    description: 'Hash tables are used in file systems to map file names to their locations on disk.',
    example: 'When you access a file by name, the file system uses a hash function to quickly locate the file on disk.',
  },
  {
    title: 'Load Balancing',
    description: 'Hash functions are used in load balancing to distribute requests across multiple servers.',
    example: 'A load balancer might use consistent hashing to ensure requests from the same client go to the same server.',
  },
]

export default function RealWorldExplorer() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Real-World Applications
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Discover how hashing techniques are used in various real-world applications
          and systems.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {applications.map((app, index) => (
          <motion.div
            key={app.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              {app.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {app.description}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Example: {app.example}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 