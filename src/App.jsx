import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@components/Navbar'
import LandingPage from '@pages/LandingPage'
import Visualizer from '@pages/Visualizer'
import RealWorldExplorer from '@pages/RealWorldExplorer'
import LearnHashing from '@pages/LearnHashing'
import { CodeDisplay } from '@components/CodeDisplay'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-8"
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/visualizer" element={<Visualizer />} />
            <Route path="/real-world" element={<RealWorldExplorer />} />
            <Route path="/learn" element={<LearnHashing />} />
            <Route path="/code" element={<CodeDisplay
              operation={null}
              activeKey={null}
              size={10}
              hashFunction={'division'}
              collisionResolution={'chaining'}
            />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

export default App
