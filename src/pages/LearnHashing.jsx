import { motion } from 'framer-motion'

const topics = [
  {
    title: 'What is Hashing?',
    content: `Hashing is a technique that converts data of arbitrary size into a fixed-size value. 
    The process involves using a hash function to transform the input data into a hash value or hash code.`,
  },
  {
    title: 'Hash Functions',
    content: `A hash function is a mathematical function that takes an input (or 'key') and returns a fixed-size string of bytes. 
    The output is typically a number that serves as an index into an array.`,
  },
  {
    title: 'Collision Resolution',
    content: `A collision occurs when two different keys hash to the same index. 
    There are several methods to handle collisions:
    - Separate Chaining: Using linked lists to store multiple items at the same index
    - Linear Probing: Looking for the next available slot
    - Quadratic Probing: Using a quadratic function to find the next slot
    - Double Hashing: Using a second hash function to determine the step size`,
  },
  {
    title: 'Load Factor',
    content: `The load factor is the ratio of the number of items stored in the hash table to the size of the table. 
    It's a measure of how full the hash table is. A high load factor can lead to more collisions.`,
  },
  {
    title: 'Time Complexity',
    content: `Hash tables provide average-case O(1) time complexity for:
    - Insertion
    - Deletion
    - Search
    
    However, in the worst case (many collisions), these operations can degrade to O(n).`,
  },
  {
    title: 'Best Practices',
    content: `1. Choose a good hash function that distributes keys uniformly
    2. Keep the load factor below 0.7 to minimize collisions
    3. Use appropriate collision resolution strategy based on your use case
    4. Consider the size of your hash table carefully`,
  },
]

export default function LearnHashing() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Learn About Hashing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Understand the fundamental concepts of hashing and how they are applied in
          computer science.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {topics.map((topic, index) => (
          <motion.div
            key={topic.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {topic.title}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {topic.content.split('\n').map((paragraph, i) => (
                <p key={i} className="text-gray-600 dark:text-gray-300 mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 