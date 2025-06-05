import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'

export function HashTable({ 
  size, 
  keys, 
  hashFunction, 
  collisionResolution, 
  isAnimating,
  activeIndex,
  activeKey,
  operation 
}) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  // Memoize the scroll function to prevent unnecessary re-renders
  const scrollToIndex = useCallback((index) => {
    if (!containerRef.current) return
    
    const containerWidth = containerRef.current.clientWidth
    const minCellWidth = 80
    const maxCellWidth = 120
    const cellWidth = Math.min(Math.max(containerWidth / size, minCellWidth), maxCellWidth)
    
    // Calculate the scroll position to center the active cell
    const scrollPosition = (index * cellWidth) - (containerWidth / 2) + (cellWidth / 2)
    
    // Smooth scroll to the position
    containerRef.current.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth'
    })
  }, [size])

  // Scroll to active index when it changes
  useEffect(() => {
    if (activeIndex !== null) {
      const timer = setTimeout(() => {
        scrollToIndex(activeIndex)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeIndex, scrollToIndex])

  useEffect(() => {
    if (!svgRef.current) return

    console.log('Rendering hash table with keys:', keys)

    const svg = d3.select(svgRef.current)
    const containerWidth = svgRef.current.clientWidth
    const containerHeight = svgRef.current.clientHeight
    
    // Calculate cell dimensions
    const minCellWidth = 80
    const maxCellWidth = 120
    const cellWidth = Math.min(Math.max(containerWidth / size, minCellWidth), maxCellWidth)
    const cellHeight = 60  // Keep original cell height
    const totalWidth = cellWidth * size
    const indexHeight = 20  // Height for index display
    const keySpacing = 20   // Spacing between keys

    // Set SVG width and height to accommodate indices and overflow
    svg.attr('width', totalWidth)
      .attr('height', cellHeight + indexHeight + 50)  // Added extra height for overflow display

    // Clear previous content
    svg.selectAll('*').remove()

    // Create cells
    const cells = svg
      .selectAll('g.cell')
      .data(Array.from({ length: size }, (_, i) => i))
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (d) => `translate(${d * cellWidth}, ${indexHeight - 5})`)

    // Add cell indices above the box
    cells
      .append('text')
      .attr('x', cellWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#4b5563')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .attr('opacity', 0)
      .transition()
      .duration(300)
      .attr('opacity', 1)
      .text((d) => d)

    // Add cell backgrounds with enhanced animations
    cells
      .append('rect')
      .attr('width', cellWidth - 2)
      .attr('height', cellHeight)
      .attr('fill', '#ffffff')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .transition()
      .duration(500)
      .attr('fill', (d) => {
        if (d === activeIndex) {
          switch (operation) {
            case 'insert': return '#dcfce7'
            case 'delete': return '#fee2e2'
            case 'search': return '#dbeafe'
            default: return '#ffffff'
          }
        }
        return '#ffffff'
      })

    // Add keys to cells with enhanced animations
    cells.each(function(d) {
      const cellGroup = d3.select(this)
      
      // Get keys for this cell
      const cellKeys = keys.filter(k => {
        const hash = typeof hashFunction === 'function' 
          ? hashFunction(k, size) 
          : k % size
        return hash === d
      })

      // Calculate starting position for keys
      const startY = 20  // Start from top of cell
      const maxVisibleKeys = 2  // Maximum number of visible keys
      const hasOverflow = cellKeys.length > maxVisibleKeys

      // Add each key to the cell with animations
      cellKeys.forEach((key, index) => {
        const isVisible = index < maxVisibleKeys
        const isOverflow = index >= maxVisibleKeys

        // Create a group for the key
        const keyGroup = cellGroup
          .append('g')
          .attr('opacity', isVisible ? 0 : 0)  // Start hidden if overflow
          .attr('transform', `translate(${cellWidth / 2}, ${startY + (index * keySpacing)}) scale(0.5)`)
          .attr('class', isOverflow ? 'overflow-key' : 'visible-key')

        // Add key text
        keyGroup
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('fill', '#000000')
          .attr('font-size', '16px')
          .attr('font-weight', '600')
          .text(key)

        // Animate visible keys
        if (isVisible) {
          const isActiveKey = key === activeKey
          keyGroup
            .transition()
            .duration(600)
            .attr('opacity', 1)
            .attr('transform', `translate(${cellWidth / 2}, ${startY + (index * keySpacing)}) scale(${isActiveKey ? 1.2 : 1})`)
            .ease(d3.easeElastic.amplitude(0.5).period(0.3))
        }

        // Add hover effects
        keyGroup
          .on('mouseover', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('transform', `translate(${cellWidth / 2}, ${startY + (index * keySpacing)}) scale(1.1)`)
          })
          .on('mouseout', function() {
            const isActiveKey = key === activeKey
            d3.select(this)
              .transition()
              .duration(200)
              .attr('transform', `translate(${cellWidth / 2}, ${startY + (index * keySpacing)}) scale(${isActiveKey ? 1.2 : 1})`)
          })
      })

      // Add overflow indicator and hover effect
      if (hasOverflow) {
        const overflowCount = cellKeys.length - maxVisibleKeys
        const overflowGroup = cellGroup
          .append('g')
          .attr('opacity', 0)
          .attr('transform', `translate(${cellWidth / 2}, ${startY + (maxVisibleKeys * keySpacing)})`)

        overflowGroup
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('fill', '#6b7280')
          .attr('font-size', '14px')
          .text(`+${overflowCount} more`)

        // Show overflow indicator
        overflowGroup
          .transition()
          .duration(300)
          .attr('opacity', 1)

        // Create overflow display group (initially hidden)
        const overflowDisplay = cellGroup
          .append('g')
          .attr('class', 'overflow-display')
          .attr('opacity', 0)
          .attr('transform', `translate(0, ${cellHeight + 5})`)

        // Add overflow keys to display
        cellKeys.slice(maxVisibleKeys).forEach((key, index) => {
          const overflowKey = overflowDisplay
            .append('text')
            .attr('x', cellWidth / 2)
            .attr('y', index * keySpacing)
            .attr('text-anchor', 'middle')
            .attr('fill', '#000000')
            .attr('font-size', '14px')
            .attr('font-weight', '600')  // Make text bold
            .text(key)

          // Add hover effects for overflow keys
          overflowKey
            .on('mouseover', function() {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', '#2563eb')  // Change color on hover
                .attr('font-size', '16px')  // Slightly larger on hover
            })
            .on('mouseout', function() {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', '#000000')
                .attr('font-size', '14px')
            })
        })

        // Add hover effect to show overflow
        cellGroup
          .on('mouseover', function() {
            // Show overflow display
            overflowDisplay
              .transition()
              .duration(200)
              .attr('opacity', 1)
            
            // Hide overflow indicator
            overflowGroup
              .transition()
              .duration(200)
              .attr('opacity', 0)
          })
          .on('mouseout', function() {
            // Hide overflow display
            overflowDisplay
              .transition()
              .duration(200)
              .attr('opacity', 0)
            
            // Show overflow indicator
            overflowGroup
              .transition()
              .duration(200)
              .attr('opacity', 1)
          })
      }

      // Add collision indicator with enhanced animation
      if (cellKeys.length > 1) {
        // Add collision label
        cellGroup
          .append('text')
          .attr('x', cellWidth / 2)
          .attr('y', -25)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ef4444')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .attr('opacity', 0)
          .transition()
          .duration(400)
          .attr('opacity', 1)
          .text(`Collision: ${cellKeys.length} keys`)

        const collisionGroup = cellGroup
          .append('g')
          .attr('opacity', 0)
          .attr('transform', `translate(${cellWidth - 10}, 10) scale(0)`)

        collisionGroup
          .append('circle')
          .attr('r', 4)
          .attr('fill', '#ef4444')
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 2)

        // Animate collision indicator with elastic effect
        collisionGroup
          .transition()
          .duration(800)
          .attr('opacity', 1)
          .attr('transform', `translate(${cellWidth - 10}, 10) scale(1)`)
          .ease(d3.easeElastic.amplitude(0.5).period(0.3))

        // Add pulsing animation
        const pulse = () => {
          collisionGroup
            .transition()
            .duration(1000)
            .attr('transform', `translate(${cellWidth - 10}, 10) scale(1.2)`)
            .transition()
            .duration(1000)
            .attr('transform', `translate(${cellWidth - 10}, 10) scale(1)`)
            .on('end', pulse)
        }
        pulse()
      }
    })

    // Add operation indicator with enhanced animation
    if (activeKey !== null) {
      const hash = typeof hashFunction === 'function'
        ? hashFunction(activeKey, size)
        : activeKey % size
      console.log(`Operation: ${operation} ${activeKey} at cell ${hash}`)

      const operationGroup = cells
        .filter((d) => d === hash)
        .append('g')
        .attr('opacity', 0)
        .attr('transform', `translate(${cellWidth / 2}, ${cellHeight - 5}) scale(0.8)`)

      operationGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', '#4b5563')
        .attr('font-size', '12px')
        .text(`${operation} ${activeKey}`)

      // Animate operation indicator with elastic pop-up
      operationGroup
        .transition()
        .duration(600)
        .attr('opacity', 1)
        .attr('transform', `translate(${cellWidth / 2}, ${cellHeight - 5}) scale(1)`)
        .ease(d3.easeElastic.amplitude(0.5).period(0.3))
        .transition()
        .delay(800)
        .duration(400)
        .attr('opacity', 0)
        .attr('transform', `translate(${cellWidth / 2}, ${cellHeight - 15}) scale(0.8)`)
    }

    // Scroll to active index with smooth animation
    if (activeIndex !== null) {
      const scrollPosition = (activeIndex * cellWidth) - (containerWidth / 2) + (cellWidth / 2)
      containerRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      })
    }
  }, [size, keys, hashFunction, collisionResolution, activeIndex, activeKey, operation])

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Hash Table Visualization
      </h2>
      <div 
        ref={containerRef}
        className="relative w-full h-[200px] overflow-x-auto"
      >
        <div className="min-w-full">
          <svg
            ref={svgRef}
            className="h-full"
            style={{ minWidth: `${size * 80}px` }}
          >
            {/* D3 will render the hash table here */}
          </svg>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Size: {size}</p>
        <p>Keys: {keys.length}</p>
        <p>Collision Resolution: {collisionResolution}</p>
        {activeKey !== null && (
          <p className="mt-2">
            {operation} {activeKey} at index {activeIndex}
          </p>
        )}
      </div>
    </div>
  )
} 