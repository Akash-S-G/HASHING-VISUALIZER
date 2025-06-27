import { useState } from 'react'
import { motion } from 'framer-motion'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HashTable from '@components/HashTable'
import { AnalyticsPanel } from '@components/AnalyticsPanel'
import { ControlPanel } from '@components/ControlPanel'
import { CustomHashEditor } from '@components/CustomHashEditor'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const hashFunctions = [
  { id: 'division', name: 'Division Method', description: 'h(k) = k mod m' },
  { id: 'multiplication', name: 'Multiplication Method', description: 'h(k) = ⌊m(kA mod 1)⌋' },
  { id: 'polynomial', name: 'Polynomial Rolling Hash', description: 'h(k) = (k₁pⁿ⁻¹ + k₂pⁿ⁻² + ... + kₙ) mod m' },
  { id: 'universal', name: 'Universal Hashing', description: 'h(k) = ((ak + b) mod p) mod m' },
  { id: 'midSquare', name: 'Mid-square Hashing', description: 'h(k) = middle digits of k²' },
  { id: 'folding', name: 'Folding Method', description: 'h(k) = sum of k parts mod m' },
  { id: 'custom', name: 'Custom', description: 'Write your own hash function!' },
]

const collisionResolutions = [
  { id: 'chaining', name: 'Separate Chaining', description: 'Using linked lists for collision resolution' },
  { id: 'linear', name: 'Linear Probing', description: 'h(k,i) = (h(k) + i) mod m' },
  { id: 'quadratic', name: 'Quadratic Probing', description: 'h(k,i) = (h(k) + i²) mod m' },
  { id: 'double', name: 'Double Hashing', description: 'h(k,i) = (h₁(k) + i·h₂(k)) mod m' },
]

export default function Visualizer() {
  const [selectedHashFunction, setSelectedHashFunction] = useState(hashFunctions[0])
  const [selectedCollisionResolution, setSelectedCollisionResolution] = useState(collisionResolutions[0])
  const [tableSize, setTableSize] = useState(10)
  const [keys, setKeys] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [analytics, setAnalytics] = useState({
    collisions: 0,
    probes: 0,
    loadFactor: 0,
  })
  const [customHashFn, setCustomHashFn] = useState((key, size) => ((key % size) + size) % size)
  const [activeIndex, setActiveIndex] = useState(null)
  const [activeKey, setActiveKey] = useState(null)
  const [currentSteps, setCurrentSteps] = useState([])
  const [currentOperation, setCurrentOperation] = useState(null)
  const [showSteps, setShowSteps] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const handleTableSizeChange = (newSize) => {
    if (newSize < 1) newSize = 1
    if (newSize > 1000) newSize = 1000
    setTableSize(newSize)
  }

  const getHashFunction = () => {
    let currentHashFn = (key, size) => ((key % size) + size) % size; // Default fallback

    console.log(`getHashFunction: selectedHashFunction.id: ${selectedHashFunction.id}`);
    console.log(`getHashFunction: typeof customHashFn: ${typeof customHashFn}`);

    if (selectedHashFunction.id === 'custom') {
      if (typeof customHashFn === 'function') {
        currentHashFn = customHashFn;
      } else {
        console.warn("getHashFunction: customHashFn is not a function, falling back to division method.");
      }
    } else {
      switch (selectedHashFunction.id) {
        case 'division':
          currentHashFn = (key, size) => key % size;
          break;
        case 'multiplication':
          currentHashFn = (key, size) => {
            const A = 0.6180339887
            return Math.floor(size * ((key * A) % 1))
          };
          break;
        case 'polynomial':
          currentHashFn = (key, size) => {
            const p = 31
            const str = key.toString()
            let hash = 0
            for (let i = 0; i < str.length; i++) {
              hash = (hash * p + str.charCodeAt(i)) % size
            }
            return hash
          };
          break;
        case 'universal':
          currentHashFn = (key, size) => {
            const a = 3, b = 7, p2 = 1000000007
            return ((a * key + b) % p2) % size
          };
          break;
        case 'midSquare':
          currentHashFn = (key, size) => {
            const square = key * key
            const str2 = square.toString()
            const mid = Math.floor(str2.length / 2)
            const midDigits = parseInt(str2.slice(mid - 1, mid + 1))
            return midDigits % size
          };
          break;
        case 'folding':
          currentHashFn = (key, size) => {
            const str3 = key.toString()
            let sum = 0
            for (let i = 0; i < str3.length; i += 2) {
              const part = parseInt(str3.slice(i, i + 2))
              sum += part
            }
            return sum % size
          };
          break;
        default:
          console.warn(`getHashFunction: Unknown hash function ID: ${selectedHashFunction.id}, falling back to division method.`);
          // currentHashFn already set to default
          break;
      }
    }
    console.log(`getHashFunction: Returning type: ${typeof currentHashFn}, value:`, currentHashFn);
    return currentHashFn;
  }

  const handleInsert = (key) => {
    if (isAnimating) return
    setIsAnimating(true)
    
    // Initialize steps tracking
    setCurrentSteps([])
    setCurrentOperation('insert')
    let steps = []
    
    const hashFn = getHashFunction()
    const hashFnName = selectedHashFunction.name || 'Default Hash Function'
    
    steps.push(`Attempting to insert key: ${key}`)
    steps.push(`Using Hash Function: ${hashFnName}`)
    
    if (selectedHashFunction.description) {
      steps.push(`Formula: ${selectedHashFunction.description}`);
    }
    
    const initialHash = hashFn(key, tableSize);
    steps.push(`Initial Hash Value: ${initialHash}`)

    if (selectedCollisionResolution.id === 'chaining') {
      steps.push(`Using Separate Chaining collision resolution`)
      
      // Check if there's already a key at this hash
      const existingKeys = keys.filter(k => hashFn(k, tableSize) === initialHash);
      if (existingKeys.length > 0) {
        steps.push(`Collision detected at index ${initialHash}. Separate Chaining: Adding key to the linked list.`)
      } else {
        steps.push(`No collision at index ${initialHash}. Adding key to the empty bucket.`)
      }
      
      setKeys([...keys, key]);
      setCurrentSteps(steps)
      
      // Update analytics
      const currentKeys = [...keys, key];
      const uniqueHashes = [...new Set(currentKeys.map(k => hashFn(k, tableSize)))];
      const calculatedCollisions = uniqueHashes.filter(hash => {
          const bucketKeys = currentKeys.filter(item => hashFn(item, tableSize) === hash);
          return bucketKeys.length > 1;
      }).length;
      
      setAnalytics({
        collisions: calculatedCollisions,
        probes: 0,
        loadFactor: currentKeys.length / tableSize
      })
      
      setActiveIndex(initialHash)
      setActiveKey(key)
      setCurrentOperation('insert')
      
      setTimeout(() => {
        setActiveIndex(null)
        setActiveKey(null)
        setCurrentOperation(null)
        setIsAnimating(false)
      }, 1000)

      toast.success(`Key '${key}' inserted at index ${initialHash}!`, { 
        autoClose: 1500
      })
    } else {
      // Probing methods
      let finalHash = initialHash;
      let probes = 0;
      const originalInitialHash = initialHash;
      
      for (let i = 0; i < tableSize; i++) {
        const currentProbeIndex = finalHash;
        const keyAtCurrentIndex = keys.find(k => hashFn(k, tableSize) === currentProbeIndex);
        
        if (!keyAtCurrentIndex) {
          steps.push(`Probe ${i + 1}: Index ${currentProbeIndex} is available. Inserting key ${key}.`)
          setKeys([...keys, key]);
          setCurrentSteps(steps)
          
          // Update analytics
          const currentKeys = [...keys, key];
          setAnalytics({
            collisions: probes,
            probes,
            loadFactor: currentKeys.length / tableSize
          })
          
          setActiveIndex(finalHash)
          setActiveKey(key)
          setCurrentOperation('insert')
          
          setTimeout(() => {
            setActiveIndex(null)
            setActiveKey(null)
            setCurrentOperation(null)
            setIsAnimating(false)
          }, 1000)

          toast.success(`Key '${key}' inserted at index ${finalHash}!`, { 
            autoClose: 1500
          })
          return;
        } else {
          steps.push(`Probe ${i + 1}: Index ${currentProbeIndex} is occupied by another key.`)
        }
        
        probes++;
        if (selectedCollisionResolution.id === 'linear') {
          finalHash = (originalInitialHash + probes) % tableSize;
          steps.push(`Linear Probing: Next probe index is (${originalInitialHash} + ${probes}) % ${tableSize} = ${finalHash}`)
        } else if (selectedCollisionResolution.id === 'quadratic') {
          finalHash = (originalInitialHash + probes * probes) % tableSize;
          steps.push(`Quadratic Probing: Next probe index is (${originalInitialHash} + ${probes}²) % ${tableSize} = ${finalHash}`)
        } else if (selectedCollisionResolution.id === 'double') {
          const secondaryHashVal = 7 - (originalInitialHash % 7);
          finalHash = (originalInitialHash + probes * secondaryHashVal) % tableSize;
          steps.push(`Double Hashing: Next probe index is (${originalInitialHash} + ${probes} * ${secondaryHashVal}) % ${tableSize} = ${finalHash}`)
        }
      }
      
      steps.push(`Table is full! Cannot insert key ${key} after probing.`)
      setCurrentSteps(steps)
      setIsAnimating(false)
      toast.error(`Table is full! Cannot insert key ${key}.`, { autoClose: 2000 });
      return;
    }
    
    steps.push(`Key ${key} successfully inserted at final index ${finalHash}.`)
    setCurrentSteps(steps)
  }

  const handleDelete = (key) => {
    if (isAnimating) return
    setIsAnimating(true)
    const hashFn = getHashFunction()
    
    // Initialize steps tracking
    setCurrentSteps([])
    setCurrentOperation('delete')
    let steps = []
    
    // Get hash function name for display
    const hashFnName = selectedHashFunction.name || 'Default Hash Function'
    
    steps.push(`Attempting to delete key: ${key}`)
    steps.push(`Using Hash Function: ${hashFnName}`)
    
    if (selectedHashFunction.description) {
      steps.push(`Formula: ${selectedHashFunction.description}`);
    }
    
    const initialHash = hashFn(key, tableSize);
    steps.push(`Initial Hash Value: ${initialHash}`)

    let deleted = false;
    let deleteIndex = null;
    let probes = 0;
    let currentIndex = initialHash;
    let newKeys = [...keys]; // Declare newKeys at the start of the function

    if (selectedCollisionResolution.id === 'chaining') {
      steps.push(`Using Separate Chaining collision resolution`)
      steps.push(`Checking bucket at index ${initialHash} for key ${key}`)
      
      const bucket = keys.filter(k => hashFn(k, tableSize) === currentIndex);
      steps.push(`Bucket contains: [${bucket.join(', ')}]`)
      
      const filteredKeys = keys.filter(k => k !== key);
      if (filteredKeys.length === keys.length) {
        steps.push(`Key ${key} not found in the hash table`)
        setCurrentSteps(steps)
        toast.info(`Key '${key}' not found.`, { autoClose: 2000 });
        setIsAnimating(false);
        return;
      }
      
      steps.push(`Key ${key} found in bucket. Removing from linked list.`)
      newKeys = filteredKeys; // Assign to the outer newKeys
      setKeys(newKeys);
      deleted = true;
      deleteIndex = initialHash;
    } else { // Probing methods
      steps.push(`Using ${selectedCollisionResolution.name} collision resolution`)
      
      for (let i = 0; i < tableSize; i++) {
        steps.push(`Probe ${i + 1}: Checking index ${currentIndex}`)
        
        if (keys.some(k => hashFn(k, tableSize) === currentIndex && k === key)) {
          // Found the key at currentIndex, now delete it
          steps.push(`Key ${key} found at index ${currentIndex}. Deleting...`)
          newKeys = keys.filter(k => !(hashFn(k, tableSize) === currentIndex && k === key)); // Update the outer newKeys
          setKeys(newKeys);
          deleted = true;
          deleteIndex = currentIndex;
          probes = i;
          break;
        } else {
          const keyInSlot = keys.find(k => hashFn(k, tableSize) === currentIndex);
          if (keyInSlot) {
            steps.push(`Index ${currentIndex} contains different key: ${keyInSlot}`)
          } else {
            steps.push(`Index ${currentIndex} is empty`)
          }
        }
        
        probes++;
        if (selectedCollisionResolution.id === 'linear') {
          const nextIndex = (initialHash + probes) % tableSize;
          steps.push(`Linear Probing: Next probe index is (${initialHash} + ${probes}) % ${tableSize} = ${nextIndex}`)
          currentIndex = nextIndex;
        } else if (selectedCollisionResolution.id === 'quadratic') {
          const nextIndex = (initialHash + probes * probes) % tableSize;
          steps.push(`Quadratic Probing: Next probe index is (${initialHash} + ${probes}²) % ${tableSize} = ${nextIndex}`)
          currentIndex = nextIndex;
        } else if (selectedCollisionResolution.id === 'double') {
          const secondaryHash = 7 - (initialHash % 7);
          const nextIndex = (initialHash + probes * secondaryHash) % tableSize;
          steps.push(`Double Hashing: Next probe index is (${initialHash} + ${probes} * ${secondaryHash}) % ${tableSize} = ${nextIndex}`)
          currentIndex = nextIndex;
        }
      }

      if (!deleted) {
        steps.push(`Key ${key} not found after probing all possible slots`)
        setCurrentSteps(steps)
        toast.info(`Key '${key}' not found.`, { autoClose: 2000 });
        setIsAnimating(false);
        return;
      }
    }
    
    steps.push(`Key ${key} successfully deleted from index ${deleteIndex}`)
    setCurrentSteps(steps)
    
    // Update analytics
    let calculatedCollisions = 0;
    if (selectedCollisionResolution.id === 'chaining') {
      // For chaining, count the number of buckets that have more than one key *after* deletion
      const currentKeysAfterDeletion = newKeys; // Now newKeys is correctly defined
      const uniqueHashes = [...new Set(currentKeysAfterDeletion.map(k => hashFn(k, tableSize)))];
      calculatedCollisions = uniqueHashes.filter(hash => {
          const bucketKeys = currentKeysAfterDeletion.filter(item => hashFn(item, tableSize) === hash);
          return bucketKeys.length > 1;
      }).length;
    } else {
      // For probing methods, 'probes' during deletion indicates collisions encountered
      calculatedCollisions = probes;
    }

    setAnalytics({
      collisions: calculatedCollisions,
      probes,
      loadFactor: (keys.length - (deleted ? 1 : 0)) / tableSize // Adjust load factor for deletion
    })
    
    // Set active state for animation
    setActiveIndex(deleteIndex);
    setActiveKey(key);
    setCurrentOperation('delete');
    
    // Reset active state after animation
    setTimeout(() => {
      setActiveIndex(null)
      setActiveKey(null)
      setCurrentOperation(null)
      setIsAnimating(false)
    }, 1000)
  }

  const handleSearch = (key) => {
    if (isAnimating) return
    setIsAnimating(true)
    
    const hashFn = getHashFunction()
    
    // Initialize steps tracking
    setCurrentSteps([])
    setCurrentOperation('search')
    let steps = []
    
    // Get hash function name for display
    const hashFnName = selectedHashFunction.name || 'Default Hash Function'
    
    steps.push(`Searching for key: ${key}`)
    steps.push(`Using Hash Function: ${hashFnName}`)
    
    if (selectedHashFunction.description) {
      steps.push(`Formula: ${selectedHashFunction.description}`);
    }
    
    const initialHash = hashFn(key, tableSize);
    steps.push(`Initial Hash Value: ${initialHash}`)
    
    let found = false;
    let searchIndex = null;
    let probes = 0;

    let currentIndex = initialHash;

    if (selectedCollisionResolution.id === 'chaining') {
      steps.push(`Using Separate Chaining collision resolution`)
      steps.push(`Checking bucket at index ${initialHash} for key ${key}`)
      
      const bucket = keys.filter(k => hashFn(k, tableSize) === currentIndex);
      steps.push(`Bucket contains: [${bucket.join(', ')}]`)
      
      if (bucket.includes(key)) {
        steps.push(`Key ${key} found in bucket at index ${currentIndex}`)
        found = true;
        searchIndex = currentIndex;
      } else {
        steps.push(`Key ${key} not found in bucket`)
      }
    } else { // Probing methods
      steps.push(`Using ${selectedCollisionResolution.name} collision resolution`)
      
      for (let i = 0; i < tableSize; i++) {
        steps.push(`Probe ${i + 1}: Checking index ${currentIndex}`)
        
        // Check if the current slot contains the key
        // For probing, we only consider the key that is actually in the slot.
        const keyInSlot = keys.find(k => hashFn(k, tableSize) === currentIndex);
        if (keyInSlot === key) {
          steps.push(`Key ${key} found at index ${currentIndex}`)
          found = true;
          searchIndex = currentIndex;
          probes = i;
          break;
        } else if (keyInSlot) {
          steps.push(`Index ${currentIndex} contains different key: ${keyInSlot}`)
        } else {
          steps.push(`Index ${currentIndex} is empty`)
        }

        probes++;
        if (selectedCollisionResolution.id === 'linear') {
          const nextIndex = (initialHash + probes) % tableSize;
          steps.push(`Linear Probing: Next probe index is (${initialHash} + ${probes}) % ${tableSize} = ${nextIndex}`)
          currentIndex = nextIndex;
        } else if (selectedCollisionResolution.id === 'quadratic') {
          const nextIndex = (initialHash + probes * probes) % tableSize;
          steps.push(`Quadratic Probing: Next probe index is (${initialHash} + ${probes}²) % ${tableSize} = ${nextIndex}`)
          currentIndex = nextIndex;
        } else if (selectedCollisionResolution.id === 'double') {
          const secondaryHash = 7 - (initialHash % 7);
          const nextIndex = (initialHash + probes * secondaryHash) % tableSize;
          steps.push(`Double Hashing: Next probe index is (${initialHash} + ${probes} * ${secondaryHash}) % ${tableSize} = ${nextIndex}`)
          currentIndex = nextIndex;
        }

        // If we've probed all possible slots and haven't found the key, stop
        if (probes >= tableSize) {
          steps.push(`Reached maximum probes (${tableSize}). Stopping search.`)
          break;
        }
      }
    }

    if (found) {
      steps.push(`Search successful: Key ${key} found at index ${searchIndex}`)
      toast.success(`Key '${key}' found at index ${searchIndex}!`, { autoClose: 1500 });
      setActiveIndex(searchIndex);
    } else {
      steps.push(`Search failed: Key ${key} not found in the hash table`)
      toast.error(`Key '${key}' not found.`, { autoClose: 2000 });
      setActiveIndex(null);
    }
    
    setCurrentSteps(steps)

    let calculatedCollisions = 0;
    if (selectedCollisionResolution.id === 'chaining') {
      // For chaining, count the number of buckets that have more than one key in the current state
      const uniqueHashes = [...new Set(keys.map(k => hashFn(k, tableSize)))];
      calculatedCollisions = uniqueHashes.filter(hash => {
          const bucketKeys = keys.filter(item => hashFn(item, tableSize) === hash);
          return bucketKeys.length > 1;
      }).length;
    } else {
      // For probing methods, 'probes' indicates collisions encountered during search
      calculatedCollisions = probes;
    }

    // Update analytics based on search operation
    setAnalytics(prevAnalytics => ({
      ...prevAnalytics,
      probes: probes,
      collisions: calculatedCollisions,
    }));

    setActiveKey(key)
    setCurrentOperation('search')
    
    // Reset active state after animation
    setTimeout(() => {
      setActiveIndex(null)
      setActiveKey(null)
      setCurrentOperation(null)
      setIsAnimating(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative pb-20">
      {/* Main visualization content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col flex-1 space-y-4 p-4"
      >
        {/* Control Panel (now includes selectors) */}
        <div className="w-full  mx-auto">
          <ControlPanel
            onInsert={handleInsert}
            onDelete={handleDelete}
            onSearch={handleSearch}
            isAnimating={isAnimating}
            onTableSizeChange={handleTableSizeChange}
            tableSize={tableSize}
            hashFunctions={hashFunctions}
            selectedHashFunction={selectedHashFunction}
            onSelectHashFunction={setSelectedHashFunction}
            collisionResolutions={collisionResolutions}
            selectedCollisionResolution={selectedCollisionResolution}
            onSelectCollisionResolution={setSelectedCollisionResolution}
            customHashEditor={<CustomHashEditor onChange={setCustomHashFn} />}
          />
        </div>

        {/* Hash Table Container - takes remaining space */}
        <div className="flex-1 w-full h-full mx-auto card p-4 overflow-auto">
          <HashTable
            size={tableSize}
            keys={keys}
            hashFunction={getHashFunction()}
            collisionResolution={selectedCollisionResolution.id}
            isAnimating={isAnimating}
            activeIndex={activeIndex}
            activeKey={activeKey}
            operation={currentOperation}
          />
        </div>
      </motion.div>
      
      {/* Fixed-position Steps Toggle Bar */}
      <motion.button
        onClick={() => setShowSteps(!showSteps)}
        className="fixed bottom-4 left-4 py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg z-50 flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showSteps ? (
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 mr-2" />
        )}
        {showSteps ? 'Hide Steps' : 'Show Steps'}
      </motion.button>

      {/* Fixed-position Analytics Toggle Button */}
      <motion.button
        onClick={() => setShowAnalytics(!showAnalytics)}
        className="fixed bottom-4 right-4 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
      </motion.button>

      {/* Conditionally Rendered Unified Steps Panel */}
      {showSteps && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-20 left-4 w-96 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-40"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {currentOperation ? `${currentOperation.charAt(0).toUpperCase() + currentOperation.slice(1)} Steps` : 'Operation Steps'}
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md h-64 overflow-y-auto">
            {currentSteps.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-200">
                {currentSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No steps to display yet. Perform an operation (insert, delete, or search) to see the process!
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Conditionally Rendered Analytics Panel */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 right-4 w-96 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-40"
        >
          <AnalyticsPanel data={analytics} />
        </motion.div>
      )}
      <ToastContainer position="top-right" />
    </div>
  )
} 