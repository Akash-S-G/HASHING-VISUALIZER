import { useState } from 'react'

const codeImplementations = {
  cpp: {
    title: 'C++ Implementation',
    code: `// Hash function implementation
int hashFunction(int key, int size) {
    return key % size;
}

// Insert operation
void insert(int key, vector<int>& hashTable) {
    int index = hashFunction(key, hashTable.size());
    hashTable[index] = key;
}

// Search operation
bool search(int key, const vector<int>& hashTable) {
    int index = hashFunction(key, hashTable.size());
    return hashTable[index] == key;
}

// Delete operation
void remove(int key, vector<int>& hashTable) {
    int index = hashFunction(key, hashTable.size());
    hashTable[index] = -1; // Mark as deleted
}`
  },
  java: {
    title: 'Java Implementation',
    code: `// Hash function implementation
public int hashFunction(int key, int size) {
    return key % size;
}

// Insert operation
public void insert(int key, int[] hashTable) {
    int index = hashFunction(key, hashTable.length);
    hashTable[index] = key;
}

// Search operation
public boolean search(int key, int[] hashTable) {
    int index = hashFunction(key, hashTable.length);
    return hashTable[index] == key;
}

// Delete operation
public void remove(int key, int[] hashTable) {
    int index = hashFunction(key, hashTable.length);
    hashTable[index] = -1; // Mark as deleted
}`
  },
  python: {
    title: 'Python Implementation',
    code: `# Hash function implementation
def hash_function(key, size):
    return key % size

# Insert operation
def insert(key, hash_table):
    index = hash_function(key, len(hash_table))
    hash_table[index] = key

# Search operation
def search(key, hash_table):
    index = hash_function(key, len(hash_table))
    return hash_table[index] == key

# Delete operation
def remove(key, hash_table):
    index = hash_function(key, len(hash_table))
    hash_table[index] = -1  # Mark as deleted`
  }
}

export function CodeDisplay({ operation, key, size }) {
  const [selectedLanguage, setSelectedLanguage] = useState('cpp')
  const [isVisible, setIsVisible] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsVisible(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        <span>Show Code</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-3/4 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Implementation Code
              </h2>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex space-x-2 mb-4">
              {Object.keys(codeImplementations).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${selectedLanguage === lang 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  {codeImplementations[lang].title}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{codeImplementations[selectedLanguage].code}</code>
              </pre>
              
              {operation && key && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Current Operation: {operation} {key} at index {key % size}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 