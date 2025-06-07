import { useState } from 'react'
import { motion } from 'framer-motion'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HashTable from '@components/HashTable'
import { HashFunctionSelector } from '@components/HashFunctionSelector'
import { CollisionResolutionSelector } from '@components/CollisionResolutionSelector'
import { AnalyticsPanel } from '@components/AnalyticsPanel'
import { ControlPanel } from '@components/ControlPanel'
import { CodeDisplay } from '@components/CodeDisplay'
import CustomHashEditor from '@components/CustomHashEditor'

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
  const [customHashFn, setCustomHashFn] = useState((key, size) => key % size)
  const [activeIndex, setActiveIndex] = useState(null)
  const [activeKey, setActiveKey] = useState(null)
  const [operation, setOperation] = useState(null)
  const [activeTab, setActiveTab] = useState('visualizer')

  const handleTableSizeChange = (newSize) => {
    if (newSize < 1) newSize = 1
    if (newSize > 100) newSize = 100
    setTableSize(newSize)
  }

  const getHashFunction = () => {
    if (selectedHashFunction.id === 'custom') return customHashFn
    switch (selectedHashFunction.id) {
      case 'division':
        return (key, size) => key % size
      case 'multiplication':
        return (key, size) => {
          const A = 0.6180339887
          return Math.floor(size * ((key * A) % 1))
        }
      case 'polynomial':
        return (key, size) => {
          const p = 31
          const str = key.toString()
          let hash = 0
          for (let i = 0; i < str.length; i++) {
            hash = (hash * p + str.charCodeAt(i)) % size
          }
          return hash
        }
      case 'universal':
        return (key, size) => {
          const a = 3, b = 7, p2 = 1000000007
          return ((a * key + b) % p2) % size
        }
      case 'midSquare':
        return (key, size) => {
          const square = key * key
          const str2 = square.toString()
          const mid = Math.floor(str2.length / 2)
          const midDigits = parseInt(str2.slice(mid - 1, mid + 1))
          return midDigits % size
        }
      case 'folding':
        return (key, size) => {
          const str3 = key.toString()
          let sum = 0
          for (let i = 0; i < str3.length; i += 2) {
            const part = parseInt(str3.slice(i, i + 2))
            sum += part
          }
          return sum % size
        }
      default:
        return (key, size) => key % size
    }
  }

  const handleInsert = (key) => {
    if (isAnimating) return
    setIsAnimating(true)
    
    // Calculate initial hash
    const hashFn = getHashFunction()
    const initialHash = hashFn(key, tableSize)
    let finalHash = initialHash
    let probes = 0
    let inserted = false; // Flag to track if insertion was successful

    // Handle collisions based on resolution method
    if (selectedCollisionResolution.id === 'chaining') {
      // For chaining, we just add the key to the list
      finalHash = initialHash;
      inserted = true; // Always inserted in chaining
      
      // Check if this is a new collision
      const existingKeys = keys.filter(k => hashFn(k, tableSize) === initialHash);
      if (existingKeys.length > 0) {
        toast.info(`Collision occurred! Key '${key}' collided with existing key(s) at index ${initialHash}`, {
          position: 'top-center',
          autoClose: 2000
        });
      }
    } else {
      // Probing methods: check for table full before attempting insertion
      if (keys.length >= tableSize) {
        toast.error('Table is full! Cannot insert more keys.', { position: 'top-center' });
        setIsAnimating(false);
        return;
      }

      let originalInitialHash = initialHash; // Keep original initial hash for probing
      let currentProbeIndex = initialHash; // Start probing from initial hash

      for (let i = 0; i < tableSize; i++) { // Iterate up to tableSize times for probing
        if (!keys.some(k => hashFn(k, tableSize) === currentProbeIndex)) { // Check if the slot is empty
          finalHash = currentProbeIndex;
          inserted = true;
          probes = i; // Number of probes
          break;
        }

        // If we hit a collision during probing, show toast
        if (i === 0) { // Only show for first collision
          toast.info(`Collision occurred! Key '${key}' collided at index ${initialHash}`, {
            position: 'top-center',
            autoClose: 2000
          });
        }

        probes++;
        if (selectedCollisionResolution.id === 'linear') {
          currentProbeIndex = (originalInitialHash + probes) % tableSize;
        } else if (selectedCollisionResolution.id === 'quadratic') {
          currentProbeIndex = (originalInitialHash + probes * probes) % tableSize;
        } else if (selectedCollisionResolution.id === 'double') {
          const secondaryHash = 7 - (originalInitialHash % 7); // Secondary hash function
          currentProbeIndex = (originalInitialHash + probes * secondaryHash) % tableSize;
        }
      }

      if (!inserted) {
        toast.error('Table is full! Cannot insert more keys after probing.', { position: 'top-center' });
        setIsAnimating(false);
        return;
      }
    }

    if (inserted) {
      const newKeys = [...keys, key];
      setKeys(newKeys);

      // Calculate collisions (only relevant for chaining visually)
      const collisions = selectedCollisionResolution.id === 'chaining' ? 
        newKeys.reduce((acc, k) => {
          const hash = hashFn(k, tableSize);
          const sameHash = newKeys.filter(k2 => hashFn(k2, tableSize) === hash);
          return acc + (sameHash.length > 1 ? 1 : 0);
        }, 0) : 0; // Collisions not typically counted this way for probing

      // Update analytics
      setAnalytics({
        collisions,
        probes,
        loadFactor: newKeys.length / tableSize
      });
      
      // Set active state for animation
      setActiveIndex(finalHash);
      setActiveKey(key);
      setOperation('insert');
      
      // Reset active state after animation
      setTimeout(() => {
        setActiveIndex(null);
        setActiveKey(null);
        setOperation(null);
        setIsAnimating(false);
      }, 1000);
    } else {
      setIsAnimating(false);
    }
    if (inserted) {
      toast.success(`Key '${key}' inserted at index ${finalHash}!`, { 
        position: 'top-center',
        autoClose: 1500 // Reduced from default 5000ms to 1500ms
      });
    }
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

    if (selectedCollisionResolution.id === 'chaining') {
      const newKeys = keys.filter(k => k !== key);
      if (newKeys.length === keys.length) {
        toast.info(`Key '${key}' not found.`, { position: 'top-center' });
        setIsAnimating(false);
        return;
      }
      setKeys(newKeys);
      deleted = true;
      deleteIndex = initialHash;
    } else { // Probing methods
      for (let i = 0; i < tableSize; i++) {
        if (keys.some(k => hashFn(k, tableSize) === currentIndex && k === key)) {
          // Found the key at currentIndex, now delete it
          const newKeys = keys.filter(k => !(hashFn(k, tableSize) === currentIndex && k === key));
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
        toast.info(`Key '${key}' not found.`, { position: 'top-center' });
        setIsAnimating(false);
        return;
      }
    }
    
    // Calculate collisions (only relevant for chaining visually)
    const collisions = selectedCollisionResolution.id === 'chaining' ? 
      keys.reduce((acc, k) => {
        const hash = hashFn(k, tableSize);
        const sameHash = keys.filter(k2 => hashFn(k2, tableSize) === hash);
        return acc + (sameHash.length > 1 ? 1 : 0);
      }, 0) : 0;

    // Update analytics
    setAnalytics({
      collisions,
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
          const secondaryHash = 7 - (initialHash % 7); // Secondary hash function
          currentIndex = (initialHash + probes * secondaryHash) % tableSize;
        }

        // If we've probed all possible slots and haven't found the key, stop
        if (probes >= tableSize) {
          break;
        }
      }
    }

    if (found) {
      toast.success(`Key '${key}' found at index ${searchIndex}!`, { position: 'top-center' });
      setActiveIndex(searchIndex);
    } else {
      toast.error(`Key '${key}' not found.`, { position: 'top-center' });
      setActiveIndex(null);
    }

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
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'visualizer' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          onClick={() => setActiveTab('visualizer')}
        >
          Visualization
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'code' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          onClick={() => setActiveTab('code')}
        >
          Code
        </button>
      </div>

      {activeTab === 'visualizer' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Left Panel */}
          <div className="space-y-8">
            <HashFunctionSelector
              functions={hashFunctions}
              selected={selectedHashFunction}
              onSelect={setSelectedHashFunction}
            />
            {selectedHashFunction.id === 'custom' && (
              <CustomHashEditor onChange={setCustomHashFn} />
            )}
            <CollisionResolutionSelector
              methods={collisionResolutions}
              selected={selectedCollisionResolution}
              onSelect={setSelectedCollisionResolution}
            />
              <AnalyticsPanel data={analytics} />
          </div>
          {/* Right Panel */}
          <div className="space-y-8">
            <ControlPanel
              onInsert={handleInsert}
              onDelete={handleDelete}
              onSearch={handleSearch}
              isAnimating={isAnimating}
              onTableSizeChange={handleTableSizeChange}
              tableSize={tableSize}
            />
          
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
      )}

      {activeTab === 'code' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CodeDisplay
            operation={operation}
            activeKey={activeKey}
            size={tableSize}
            hashFunction={selectedHashFunction.id}
            collisionResolution={selectedCollisionResolution.id}
          />
        </motion.div>
      )}
      
      <ToastContainer />
    </div>
  )
} 