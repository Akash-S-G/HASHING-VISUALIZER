import { useState } from 'react'
import Controls from './components/Controls'
import HashTable from './components/HashTable'
import {
  insertChaining, searchChaining, deleteChaining,
  insertLinear, searchLinear, deleteLinear,
  insertQuadratic, searchQuadratic, deleteQuadratic,
  insertDouble, searchDouble, deleteDouble
} from './utils/hashing'
import './App.css'

const TABLE_SIZE = 7

function App() {
  const [table, setTable] = useState(Array(TABLE_SIZE).fill(null))
  const [method, setMethod] = useState('chaining')
  const [inputValue, setInputValue] = useState('')
  const [animationState, setAnimationState] = useState(null)

  const getTableCopy = () => {
    if (method === 'chaining') return table.map(cell => cell ? [...cell] : [])
    return [...table]
  }

  const handleInsert = () => {
    const key = parseInt(inputValue, 10)
    if (isNaN(key) || key < 0) {
      alert('Please enter a valid non-negative number.')
      setInputValue('')
      return
    }
    let result
    let newTable = getTableCopy()
    switch (method) {
      case 'chaining':
        result = insertChaining(newTable, key)
        break
      case 'linear':
        result = insertLinear(newTable, key)
        break
      case 'quadratic':
        result = insertQuadratic(newTable, key)
        break
      case 'double':
        result = insertDouble(newTable, key)
        break
      default:
        return
    }
    if (!result.success) {
      alert(result.reason === 'Exists' ? 'Value already exists.' : 'Table is full.')
    } else {
      setTable([...newTable])
      setAnimationState({ type: 'insert', index: result.index })
    }
    setInputValue('')
  }

  const handleSearch = () => {
    const key = parseInt(inputValue, 10)
    if (isNaN(key) || key < 0) {
      alert('Please enter a valid non-negative number.')
      setInputValue('')
      return
    }
    let result
    switch (method) {
      case 'chaining':
        result = searchChaining(table, key)
        break
      case 'linear':
        result = searchLinear(table, key)
        break
      case 'quadratic':
        result = searchQuadratic(table, key)
        break
      case 'double':
        result = searchDouble(table, key)
        break
      default:
        return
    }
    if (result.found) {
      setAnimationState({ type: 'search', index: result.index })
    } else {
      alert('Value not found.')
      setAnimationState(null)
    }
    setInputValue('')
  }

  const handleDelete = () => {
    const key = parseInt(inputValue, 10)
    if (isNaN(key) || key < 0) {
      alert('Please enter a valid non-negative number.')
      setInputValue('')
      return
    }
    let result
    let newTable = getTableCopy()
    switch (method) {
      case 'chaining':
        result = deleteChaining(newTable, key)
        break
      case 'linear':
        result = deleteLinear(newTable, key)
        break
      case 'quadratic':
        result = deleteQuadratic(newTable, key)
        break
      case 'double':
        result = deleteDouble(newTable, key)
        break
      default:
        return
    }
    if (!result.success) {
      alert('Value not found.')
    } else {
      setTable([...newTable])
      setAnimationState({ type: 'delete', index: result.index })
    }
    setInputValue('')
  }

  const handleReset = () => {
    setTable(Array(TABLE_SIZE).fill(null))
    setAnimationState(null)
    setInputValue('')
  }

  return (
    <div className="App">
      <h1>Hashing Visualizer</h1>
      <Controls
        inputValue={inputValue}
        setInputValue={setInputValue}
        method={method}
        setMethod={setMethod}
        onInsert={handleInsert}
        onSearch={handleSearch}
        onDelete={handleDelete}
        onReset={handleReset}
      />
      <HashTable
        table={table}
        method={method}
        animationState={animationState}
      />
    </div>
  )
}

export default App
