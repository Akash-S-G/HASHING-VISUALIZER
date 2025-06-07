import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  const [tableState, setTableState] = useState(() => {
    if (collisionResolutions[0].id === 'chaining') {
      return Array(10).fill(null).map(() => [])
    } else {
      return Array(10).fill(null)
    }
  })
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

  // Effect to re-initialize tableState when tableSize or collisionResolution changes
  useEffect(() => {
    if (selectedCollisionResolution.id === 'chaining') {
      setTableState(Array(tableSize).fill(null).map(() => []))
    } else {
      setTableState(Array(tableSize).fill(null))
    }
  }, [tableSize, selectedCollisionResolution])

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
    
    const hashFn = getHashFunction()
    const initialHash = hashFn(key, tableSize)
    let currentProbes = 0
    let finalIndex = -1
    let newTableState = [...tableState]

    if (selectedCollisionResolution.id === 'chaining') {
      newTableState[initialHash].push(key)
      finalIndex = initialHash
    } else {
      // Probing methods
      let indexToProbe = initialHash

      // Comprehensive check to see if the key already exists anywhere in the table for probing methods
      let keyExistsInTable = false
      for (let i = 0; i < tableSize; i++) {
        if (tableState[i] === key) {
          keyExistsInTable = true
          break
        }
      }

      if (keyExistsInTable) {
        console.warn(`Key ${key} already exists in the table. Not inserting duplicate.`) 
        setIsAnimating(false)
        return // Do not insert duplicate keys
      }

      while (currentProbes < tableSize) {
        // If the slot is empty, insert the key
        if (newTableState[indexToProbe] === null) {
          finalIndex = indexToProbe
          newTableState[finalIndex] = key
          console.log(`Probing insert: Key ${key} inserted at finalIndex ${finalIndex} after ${currentProbes} probes.`)
          break
        }

        // If the slot is occupied by a different key, probe for the next slot
        currentProbes++
        if (selectedCollisionResolution.id === 'linear') {
          indexToProbe = (initialHash + currentProbes) % tableSize
        } else if (selectedCollisionResolution.id === 'quadratic') {
          indexToProbe = (initialHash + currentProbes * currentProbes) % tableSize
        } else if (selectedCollisionResolution.id === 'double') {
          const secondaryHash = 7 - (initialHash % 7) // Secondary hash function
          indexToProbe = (initialHash + currentProbes * secondaryHash) % tableSize
        }
        console.log(`Probing: Initial hash ${initialHash}, current probe count ${currentProbes}, next index to probe ${indexToProbe}`)

        // If we've probed through all available slots and haven't found an empty one
        if (currentProbes >= tableSize) {
          console.warn('Table is full or could not find a spot for key:', key)
          setIsAnimating(false)
          return
        }
      }

      if (finalIndex === -1) {
        console.warn('Table is full or could not find a spot for key:', key)
        setIsAnimating(false)
        return
      }
    }

    setTableState(newTableState)
    console.log('Visualizer - tableState after insert:', newTableState)
    
    // Calculate analytics
    let currentCollisions = 0
    let totalProbes = 0
    let filledSlots = 0

    if (selectedCollisionResolution.id === 'chaining') {
      newTableState.forEach(chain => {
        if (chain.length > 1) {
          currentCollisions += (chain.length - 1)
        }
        filledSlots += chain.length
      })
    } else {
      newTableState.forEach((val, idx) => {
        if (val !== null) {
          filledSlots++
          const initialValHash = hashFn(val, tableSize)
          let probeCount = 0
          let currentValHash = initialValHash
          
          // Find how many probes it took to place this key
          while (probeCount < tableSize) {
            if (currentValHash === idx) {
              break
            }
            probeCount++
            if (selectedCollisionResolution.id === 'linear') {
              currentValHash = (initialValHash + probeCount) % tableSize
            } else if (selectedCollisionResolution.id === 'quadratic') {
              currentValHash = (initialValHash + probeCount * probeCount) % tableSize
            } else if (selectedCollisionResolution.id === 'double') {
              const secondaryHash = 7 - (initialValHash % 7)
              currentValHash = (initialValHash + probeCount * secondaryHash) % tableSize
            }
          }
          totalProbes += probeCount
          if (probeCount > 0) currentCollisions++ // A collision occurred if probes were needed
        }
      })
    }

    setAnalytics({
      collisions: currentCollisions,
      probes: totalProbes,
      loadFactor: filledSlots / tableSize
    })
    
    // Set active state for animation
    setActiveIndex(finalIndex)
    setActiveKey(key)
    setOperation('insert')
    
    // Reset active state after animation
    setTimeout(() => {
      setActiveIndex(null)
      setActiveKey(null)
      setOperation(null)
      setIsAnimating(false)
    }, 1000)
  }

  const handleDelete = (key) => {
    if (isAnimating) return
    setIsAnimating(true)
    const hashFn = getHashFunction()
    let newTableState = [...tableState]
    let deletedIndex = -1

    if (selectedCollisionResolution.id === 'chaining') {
      newTableState = newTableState.map((chain, index) => {
        const foundIndex = chain.indexOf(key)
        if (foundIndex !== -1) {
          deletedIndex = index
          return chain.filter(k => k !== key)
        }
        return chain
      })
    } else {
      // Probing methods
      let initialHash = hashFn(key, tableSize)
      let currentProbes = 0
      let indexToProbe = initialHash

      while (currentProbes < tableSize) {
        if (newTableState[indexToProbe] === key) {
          deletedIndex = indexToProbe
          newTableState[deletedIndex] = null // Mark as deleted
          break
        } else if (newTableState[indexToProbe] === null) {
          // Found an empty slot, key is not in table
          console.warn(`Key ${key} not found for deletion.`)
          deletedIndex = -1 // Indicate not found for animation
          break
        }

        currentProbes++
        if (selectedCollisionResolution.id === 'linear') {
          indexToProbe = (initialHash + currentProbes) % tableSize
        } else if (selectedCollisionResolution.id === 'quadratic') {
          indexToProbe = (initialHash + currentProbes * currentProbes) % tableSize
        } else if (selectedCollisionResolution.id === 'double') {
          const secondaryHash = 7 - (initialHash % 7)
          indexToProbe = (initialHash + currentProbes * secondaryHash) % tableSize
        }
      }
    }

    setTableState(newTableState)
    
    // Recalculate analytics after deletion
    let currentCollisions = 0
    let totalProbes = 0
    let filledSlots = 0

    if (selectedCollisionResolution.id === 'chaining') {
      newTableState.forEach(chain => {
        if (chain.length > 1) {
          currentCollisions += (chain.length - 1)
        }
        filledSlots += chain.length
      })
    } else {
      newTableState.forEach((val, idx) => {
        if (val !== null) {
          filledSlots++
          const initialValHash = hashFn(val, tableSize)
          let probeCount = 0
          let currentValHash = initialValHash
          
          while (probeCount < tableSize) {
            if (currentValHash === idx) {
              break
            }
            probeCount++
            if (selectedCollisionResolution.id === 'linear') {
              currentValHash = (initialValHash + probeCount) % tableSize
            } else if (selectedCollisionResolution.id === 'quadratic') {
              currentValHash = (initialValHash + probeCount * probeCount) % tableSize
            } else if (selectedCollisionResolution.id === 'double') {
              const secondaryHash = 7 - (initialValHash % 7)
              currentValHash = (initialValHash + probeCount * secondaryHash) % tableSize
            }
          }
          totalProbes += probeCount
          if (probeCount > 0) currentCollisions++
        }
      })
    }

    setAnalytics({
      collisions: currentCollisions,
      probes: totalProbes,
      loadFactor: filledSlots / tableSize
    })
    
    // Set active state for animation
    setActiveIndex(deletedIndex !== -1 ? deletedIndex : null) // Set to null if not found
    setActiveKey(key)
    setOperation('delete')
    
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
    const initialHash = hashFn(key, tableSize)
    let foundIndex = -1
    let currentProbes = 0

    if (selectedCollisionResolution.id === 'chaining') {
      const chain = tableState[initialHash]
      if (chain && chain.includes(key)) {
        foundIndex = initialHash
      }
    } else {
      let indexToProbe = initialHash
      while (currentProbes < tableSize) {
        if (tableState[indexToProbe] === key) {
          foundIndex = indexToProbe
          break
        } else if (tableState[indexToProbe] === null) {
          // Found an empty slot, key is not in table
          break
        }

        currentProbes++
        if (selectedCollisionResolution.id === 'linear') {
          indexToProbe = (initialHash + currentProbes) % tableSize
        } else if (selectedCollisionResolution.id === 'quadratic') {
          indexToProbe = (initialHash + currentProbes * currentProbes) % tableSize
        } else if (selectedCollisionResolution.id === 'double') {
          const secondaryHash = 7 - (initialHash % 7)
          indexToProbe = (initialHash + currentProbes * secondaryHash) % tableSize
        }
      }
    }

    // Set active state for animation
    setActiveIndex(foundIndex !== -1 ? foundIndex : null) // Set to null if not found
    setActiveKey(key)
    setOperation('search')
    
    // Recalculate analytics for search (probes for search operation)
    let searchProbes = 0
    if (foundIndex !== -1 && selectedCollisionResolution.id !== 'chaining') { // Only count probes if key was found and it's a probing method
      const initialSearchHash = hashFn(key, tableSize)
      let currentSearchIndex = initialSearchHash
      while (searchProbes < tableSize) {
        if (tableState[currentSearchIndex] === key) {
          // Key found
          break
        }
        if (tableState[currentSearchIndex] === null) {
          // Reached an empty slot before finding the key (implies key not present, or deleted without shifting)
          break
        }
        searchProbes++
        if (selectedCollisionResolution.id === 'linear') {
          currentSearchIndex = (initialSearchHash + searchProbes) % tableSize
        } else if (selectedCollisionResolution.id === 'quadratic') {
          currentSearchIndex = (initialSearchHash + searchProbes * searchProbes) % tableSize
        } else if (selectedCollisionResolution.id === 'double') {
          const secondarySearchHash = 7 - (initialSearchHash % 7)
          currentSearchIndex = (initialSearchHash + searchProbes * secondarySearchHash) % tableSize
        }
      }
    }
    setAnalytics(prev => ({ ...prev, probes: searchProbes }))

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
            tableState={tableState} // Pass tableState instead of keys
            hashFunction={getHashFunction()}
            collisionResolution={selectedCollisionResolution.id}
            isAnimating={isAnimating}
            activeIndex={activeIndex}
            activeKey={activeKey}
            operation={operation}
          />
          <CodeDisplay
            operation={operation}
            key={activeKey}
            size={tableSize}
          />
        </div>
      </motion.div>
    </div>
  )
} 