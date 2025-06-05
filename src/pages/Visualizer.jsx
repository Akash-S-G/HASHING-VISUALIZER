import { useState } from 'react'
import { motion } from 'framer-motion'
import { HashTable } from '@components/HashTable'
import { HashFunctionSelector } from '@components/HashFunctionSelector'
import { CollisionResolutionSelector } from '@components/CollisionResolutionSelector'
import { AnalyticsPanel } from '@components/AnalyticsPanel'
import { ControlPanel } from '@components/ControlPanel'
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

    // Handle collisions based on resolution method
    if (selectedCollisionResolution.id === 'chaining') {
      // For chaining, we just add the key to the list
      finalHash = initialHash
    } else if (selectedCollisionResolution.id === 'linear') {
      // Linear probing: h(k,i) = (h(k) + i) mod m
      while (keys.some(k => hashFn(k, tableSize) === finalHash)) {
        finalHash = (initialHash + probes) % tableSize
        probes++
        if (probes >= tableSize) {
          // Table is full
          setIsAnimating(false)
          return
        }
      }
    } else if (selectedCollisionResolution.id === 'quadratic') {
      // Quadratic probing: h(k,i) = (h(k) + i²) mod m
      while (keys.some(k => hashFn(k, tableSize) === finalHash)) {
        finalHash = (initialHash + probes * probes) % tableSize
        probes++
        if (probes >= tableSize) {
          // Table is full
          setIsAnimating(false)
          return
        }
      }
    } else if (selectedCollisionResolution.id === 'double') {
      // Double hashing: h(k,i) = (h₁(k) + i·h₂(k)) mod m
      const secondaryHash = 7 - (initialHash % 7) // Secondary hash function
      while (keys.some(k => hashFn(k, tableSize) === finalHash)) {
        finalHash = (initialHash + probes * secondaryHash) % tableSize
        probes++
        if (probes >= tableSize) {
          // Table is full
          setIsAnimating(false)
          return
        }
      }
    }

    const newKeys = [...keys, key]
    setKeys(newKeys)
    
    // Calculate collisions
    const collisions = newKeys.reduce((acc, k) => {
      const hash = hashFn(k, tableSize)
      const sameHash = newKeys.filter(k2 => hashFn(k2, tableSize) === hash)
      return acc + (sameHash.length > 1 ? 1 : 0)
    }, 0)

    // Update analytics
    setAnalytics({
      collisions,
      probes,
      loadFactor: newKeys.length / tableSize
    })
    
    // Set active state for animation
    setActiveIndex(finalHash)
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
    const newKeys = keys.filter(k => k !== key)
    setKeys(newKeys)
    
    // Calculate collisions
    const collisions = newKeys.reduce((acc, k) => {
      const hash = hashFn(k, tableSize)
      const sameHash = newKeys.filter(k2 => hashFn(k2, tableSize) === hash)
      return acc + (sameHash.length > 1 ? 1 : 0)
    }, 0)

    // Calculate probes based on collision resolution
    let probes = 0
    if (selectedCollisionResolution.id === 'linear') {
      probes = newKeys.reduce((acc, k) => {
        const hash = hashFn(k, tableSize)
        const sameHash = newKeys.filter(k2 => hashFn(k2, tableSize) === hash)
        return acc + (sameHash.length - 1)
      }, 0)
    } else if (selectedCollisionResolution.id === 'quadratic') {
      probes = newKeys.reduce((acc, k) => {
        const hash = hashFn(k, tableSize)
        const sameHash = newKeys.filter(k2 => hashFn(k2, tableSize) === hash)
        return acc + (sameHash.length - 1) * 2
      }, 0)
    }

    // Update analytics
    setAnalytics({
      collisions,
      probes,
      loadFactor: newKeys.length / tableSize
    })
    
    // Set active state for animation
    const hash = hashFn(key, tableSize)
    setActiveIndex(hash)
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
    
    // Set active state for animation
    const hashFn = getHashFunction()
    const hash = hashFn(key, tableSize)
    setActiveIndex(hash)
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
          <ControlPanel
            onInsert={handleInsert}
            onDelete={handleDelete}
            onSearch={handleSearch}
            isAnimating={isAnimating}
            onTableSizeChange={handleTableSizeChange}
            tableSize={tableSize}
          />
        </div>
        {/* Right Panel */}
        <div className="space-y-8">
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
          <AnalyticsPanel data={analytics} />
        </div>
      </motion.div>
    </div>
  )
} 