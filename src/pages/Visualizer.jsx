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
  const [operation, setOperation] = useState(null)
  const [insertionSteps, setInsertionSteps] = useState([])
  const [showInsertionSteps, setShowInsertionSteps] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const handleTableSizeChange = (newSize) => {
    if (newSize < 1) newSize = 1
    if (newSize > 100) newSize = 100
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
    setInsertionSteps([])

    console.log('handleInsert: Calling getHashFunction()');
    const hashFn = getHashFunction()
    console.log('handleInsert: hashFn received from getHashFunction():', typeof hashFn, hashFn);

    const hashFnName = hashFunctions.find(f => f.id === selectedHashFunction.id)?.name || selectedHashFunction.id
    const initialHash = hashFn(key, tableSize)
    let finalHash = initialHash
    let probes = 0
    let inserted = false
    let currentSteps = []

    currentSteps.push(`Attempting to insert key: ${key}`)
    currentSteps.push(`Using Hash Function: ${hashFnName}`)
    if (selectedHashFunction.id !== 'custom') {
      currentSteps.push(`Formula: ${selectedHashFunction.description}`);
    }
    currentSteps.push(`Initial Hash Value: ${initialHash}`)

    if (selectedCollisionResolution.id === 'chaining') {
      finalHash = initialHash
      inserted = true
      
      const existingKeys = keys.filter(k => hashFn(k, tableSize) === initialHash)
      if (existingKeys.length > 0) {
        currentSteps.push(`Collision detected at index ${initialHash}. Separate Chaining: Adding key to the linked list.`)
        toast.info(`Collision occurred! Key '${key}' collided with existing key(s) at index ${initialHash}`, {
          autoClose: 2000
        })
      } else {
        currentSteps.push(`No collision at index ${initialHash}. Adding key to the empty bucket.`)
      }
    } else {
      if (keys.length >= tableSize) {
        currentSteps.push(`Table is full! Cannot insert key ${key}.`)
        toast.error('Table is full! Cannot insert more keys.', { autoClose: 2000 })
        setIsAnimating(false)
        setInsertionSteps(currentSteps)
        return
      }

      let originalInitialHash = initialHash
      let currentProbeIndex = initialHash
      
      for (let i = 0; i < tableSize; i++) {
        const isOccupied = keys.some(k => hashFn(k, tableSize) === currentProbeIndex)

        if (!isOccupied) {
          finalHash = currentProbeIndex
          inserted = true
          probes = i
          currentSteps.push(`Probe ${i + 1}: Index ${currentProbeIndex} is available. Inserting key ${key}.`)
          break
        }

        currentSteps.push(`Probe ${i + 1}: Index ${currentProbeIndex} is occupied by another key.`)
        if (i === 0) {
          toast.info(`Collision occurred! Key '${key}' collided at index ${initialHash}`, {
            autoClose: 2000
          })
        }

        probes++
        if (selectedCollisionResolution.id === 'linear') {
          currentProbeIndex = (originalInitialHash + probes) % tableSize
          currentSteps.push(`Linear Probing: Next probe index is (${originalInitialHash} + ${probes}) % ${tableSize} = ${currentProbeIndex}`)
        } else if (selectedCollisionResolution.id === 'quadratic') {
          currentProbeIndex = (originalInitialHash + probes * probes) % tableSize
          currentSteps.push(`Quadratic Probing: Next probe index is (${originalInitialHash} + ${probes}²) % ${tableSize} = ${currentProbeIndex}`)
        } else if (selectedCollisionResolution.id === 'double') {
          const secondaryHashVal = 7 - (originalInitialHash % 7); // Simplified secondary hash
          currentProbeIndex = (originalInitialHash + probes * secondaryHashVal) % tableSize;
          currentSteps.push(`Double Hashing: Next probe index is (${originalInitialHash} + ${probes} * ${secondaryHashVal}) % ${tableSize} = ${currentProbeIndex}`)
        }
      }

      if (!inserted) {
        currentSteps.push(`Table is full! Cannot insert key ${key} after probing.`)
        toast.error('Table is full! Cannot insert more keys after probing.', { autoClose: 2000 })
        setIsAnimating(false)
        setInsertionSteps(currentSteps)
        return
      }
    }

    if (inserted) {
      const newKeys = [...keys, key]
      setKeys(newKeys)
      currentSteps.push(`Key ${key} successfully inserted at final index ${finalHash}.`)

      let calculatedCollisions = 0;
      console.log('handleInsert: Calculating collisions for chaining. newKeys:', newKeys, 'tableSize:', tableSize);
      if (selectedCollisionResolution.id === 'chaining') {
        // For chaining, count the sum of (number of keys in bucket - 1) for all buckets with more than one key.
        // This represents the number of 'extra' keys due to collisions.
        const uniqueHashes = [...new Set(newKeys.map(k => hashFn(k, tableSize)))];
        console.log('handleInsert: Unique hashes for newKeys:', uniqueHashes);
        calculatedCollisions = uniqueHashes.reduce((sum, hash) => {
            const bucketKeys = newKeys.filter(item => hashFn(item, tableSize) === hash);
            console.log(`handleInsert: Hash ${hash} has ${bucketKeys.length} keys.`);
            return sum + (bucketKeys.length > 1 ? (bucketKeys.length - 1) : 0);
        }, 0);
        console.log('handleInsert: Calculated collisions for chaining:', calculatedCollisions);
      } else {
        // For probing methods, 'probes' indicates the number of collisions encountered
        calculatedCollisions = probes;
        console.log('handleInsert: Calculated collisions for probing (probes):', calculatedCollisions);
      }

      setAnalytics({
        collisions: calculatedCollisions,
        probes,
        loadFactor: newKeys.length / tableSize
      })
      
      setActiveIndex(finalHash)
      setActiveKey(key)
      setOperation('insert')
      
      setTimeout(() => {
        setActiveIndex(null)
        setActiveKey(null)
        setOperation(null)
        setIsAnimating(false)
      }, 1000)

      toast.success(`Key '${key}' inserted at index ${finalHash}!`, { 
        autoClose: 1500
      })
    } else {
      setIsAnimating(false)
    }
    setInsertionSteps(currentSteps)
  }

  const handleDelete = (key) => {
    if (isAnimating) return
    setIsAnimating(true)
    const hashFn = getHashFunction()

    let deleted = false;
    let deleteIndex = null;
    let probes = 0;
    const initialHash = hashFn(key, tableSize);
    let currentIndex = initialHash;
    let newKeys = [...keys]; // Declare newKeys at the start of the function

    if (selectedCollisionResolution.id === 'chaining') {
      const filteredKeys = keys.filter(k => k !== key);
      if (filteredKeys.length === keys.length) {
        toast.info(`Key '${key}' not found.`, { autoClose: 2000 });
        setIsAnimating(false);
        return;
      }
      newKeys = filteredKeys; // Assign to the outer newKeys
      setKeys(newKeys);
      deleted = true;
      deleteIndex = initialHash;
    } else { // Probing methods
      for (let i = 0; i < tableSize; i++) {
        if (keys.some(k => hashFn(k, tableSize) === currentIndex && k === key)) {
          // Found the key at currentIndex, now delete it
          newKeys = keys.filter(k => !(hashFn(k, tableSize) === currentIndex && k === key)); // Update the outer newKeys
          setKeys(newKeys);
          deleted = true;
          deleteIndex = currentIndex;
          probes = i;
          break;
        }
        probes++;
        if (selectedCollisionResolution.id === 'linear') {
          currentIndex = (initialHash + probes) % tableSize;
        } else if (selectedCollisionResolution.id === 'quadratic') {
          currentIndex = (initialHash + probes * probes) % tableSize;
        } else if (selectedCollisionResolution.id === 'double') {
          const secondaryHash = 7 - (initialHash % 7);
          currentIndex = (initialHash + probes * secondaryHash) % tableSize;
        }
      }

      if (!deleted) {
        toast.info(`Key '${key}' not found.`, { autoClose: 2000 });
        setIsAnimating(false);
        return;
      }
    }
    
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
    setOperation('delete');
    
    // Reset active state after animation
    setTimeout(() => {
      setActiveIndex(null)
      setActiveKey(null)
      setOperation(null)
      setIsAnimating(false)
    }, 1000)
  }

  const handleSearch = (key) => {
    if (isAnimating) return
    setIsAnimating(true)
    
    const hashFn = getHashFunction()
    let found = false;
    let searchIndex = null;
    let probes = 0;

    const initialHash = hashFn(key, tableSize);
    let currentIndex = initialHash;

    if (selectedCollisionResolution.id === 'chaining') {
      const bucket = keys.filter(k => hashFn(k, tableSize) === currentIndex);
      if (bucket.includes(key)) {
        found = true;
        searchIndex = currentIndex;
      }
    } else { // Probing methods
      for (let i = 0; i < tableSize; i++) {
        // Check if the current slot contains the key
        // For probing, we only consider the key that is actually in the slot.
        const keyInSlot = keys.find(k => hashFn(k, tableSize) === currentIndex);
        if (keyInSlot === key) {
          found = true;
          searchIndex = currentIndex;
          probes = i;
          break;
        }

        probes++;
        if (selectedCollisionResolution.id === 'linear') {
          currentIndex = (initialHash + probes) % tableSize;
        } else if (selectedCollisionResolution.id === 'quadratic') {
          currentIndex = (initialHash + probes * probes) % tableSize;
        } else if (selectedCollisionResolution.id === 'double') {
          const secondaryHash = 7 - (initialHash % 7);
          currentIndex = (initialHash + probes * secondaryHash) % tableSize;
        }

        // If we've probed all possible slots and haven't found the key, stop
        if (probes >= tableSize) {
          break;
        }
      }
    }

    if (found) {
      toast.success(`Key '${key}' found at index ${searchIndex}!`, { autoClose: 1500 });
      setActiveIndex(searchIndex);
    } else {
      toast.error(`Key '${key}' not found.`, { autoClose: 2000 });
      setActiveIndex(null);
    }

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
    setOperation('search')
    
    // Reset active state after animation
    setTimeout(() => {
      setActiveIndex(null)
      setActiveKey(null)
      setOperation(null)
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
            operation={operation}
          />
        </div>
      </motion.div>
      
      {/* Fixed-position Insertion Steps Toggle Bar */}
      <motion.button
        onClick={() => setShowInsertionSteps(!showInsertionSteps)}
        className="fixed bottom-4 left-4 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg z-50 flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showInsertionSteps ? (
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 mr-2" />
        )}
        {showInsertionSteps ? 'Hide Steps' : 'Show Steps'}
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

      {/* Conditionally Rendered Insertion Steps Panel */}
      {showInsertionSteps && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-20 left-4 w-96 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-40"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Insertion Steps</h2>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md h-64 overflow-y-auto">
            {insertionSteps.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-200">
                {insertionSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No insertion steps to display yet. Insert a key to see the process!</p>
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