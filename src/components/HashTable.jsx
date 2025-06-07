import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { CodeDisplay } from './CodeDisplay'

export default function HashTable({
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
    if (!svgRef.current) return;

    const tableState = Array(size).fill(null);

    if (collisionResolution === 'chaining') {
      for (let i = 0; i < size; i++) {
        tableState[i] = [];
      }
      keys.forEach(key => {
        const hash = hashFunction(key, size);
        tableState[hash].push(key);
      });
    } else {
      // For probing, we need to correctly place each key in the table based on probing sequence
      // This logic must *replicate* the insertion logic from Visualizer.jsx
      const tempProbingTable = Array(size).fill(null); // Temporary table to simulate placements
      keys.forEach(key => {
        const initialHash = hashFunction(key, size);
        let currentIndex = initialHash;
        let probes = 0;
        let foundSpot = false;

        // Iterate through possible probe positions to find where this key *would be* placed
        for (let i = 0; i < size; i++) {
          if (tempProbingTable[currentIndex] === null) {
            // Found an empty spot in the simulated table, place the key
            tempProbingTable[currentIndex] = key;
            foundSpot = true;
            break;
          }
          // If the spot is occupied by the same key, it means the key is already placed there
          // This can happen during re-renders, and we should just consider it placed.
          if (tempProbingTable[currentIndex] === key) {
            foundSpot = true;
            break;
          }

          probes++;
          if (collisionResolution === 'linear') {
            currentIndex = (initialHash + probes) % size;
          } else if (collisionResolution === 'quadratic') {
            currentIndex = (initialHash + probes * probes) % size;
          } else if (collisionResolution === 'double') {
            const secondaryHash = 7 - (initialHash % 7); // Simple secondary hash
            currentIndex = (initialHash + probes * secondaryHash) % size;
          }
        }
      });
      // After all keys are placed in the temporary table, copy it to tableState
      for (let i = 0; i < size; i++) {
        tableState[i] = tempProbingTable[i];
      }
    }

    console.log('HashTable - Derived tableState:', tableState);

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
    const keySpacing = 25   // Spacing between keys (increased for better visibility)

    // Set SVG width and height to accommodate indices and overflow
    svg.attr('width', totalWidth)
      .attr('height', cellHeight + indexHeight + 50)  // Added extra height for overflow display

    // Clear previous content
    svg.selectAll('*').remove()

    // Create cells
    const cells = svg
      .selectAll('g.cell')
      .data(Array.from({ length: size }, (_, i) => i)) // Data is just the index
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

      let cellKeys = []
      if (collisionResolution === 'chaining') {
        // For chaining, the cell's data is an array of keys
        cellKeys = tableState[d] || []
      } else {
        // For probing, the cell's data is a single key or null
        // Ensure only the key actually in this specific slot is displayed
        if (tableState[d] !== null) {
          cellKeys = [tableState[d]]
        }
      }

      // Define node dimensions for chaining
      const nodeWidth = cellWidth * 0.7;
      const nodeHeight = 30;
      const nodeSpacing = nodeHeight + 10; // Spacing between nodes

      // Calculate starting position for keys
      const startY = 10; // Adjusted starting Y to allow space for linked list nodes

      // For probing methods, maxVisibleKeys is 1 as only one key resides per slot
      const maxVisibleKeys = collisionResolution === 'chaining' ? 2 : 1 // Keep first 2 visible
      const hasOverflow = cellKeys.length > maxVisibleKeys && collisionResolution === 'chaining'

      // Add each key to the cell with animations
      cellKeys.forEach((key, index) => {
        if (collisionResolution === 'chaining') {
          const xPos = cellWidth / 2;
          const yPos = startY + (index * nodeSpacing);

          const keyGroup = cellGroup
            .append('g')
            .attr('opacity', 0) // Start hidden for animation
            .attr('transform', `translate(${xPos}, ${yPos})`);

          // Add node background
          keyGroup.append('rect')
            .attr('x', -nodeWidth / 2)
            .attr('y', -nodeHeight / 2)
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .attr('fill', '#f3f4f6')
            .attr('stroke', '#d1d5db')
            .attr('stroke-width', 1)
            .attr('rx', 4);

          // Add key text
          keyGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text(key);

          // Add connecting lines (pointers)
          if (index < cellKeys.length - 1) {
            // Line to next node
            cellGroup.append('line')
              .attr('x1', xPos)
              .attr('y1', yPos + nodeHeight / 2)
              .attr('x2', xPos)
              .attr('y2', yPos + nodeHeight / 2 + (nodeSpacing - nodeHeight))
              .attr('stroke', '#6b7280')
              .attr('stroke-width', 1)
              .attr('marker-end', 'url(#arrowhead)') // Attach arrowhead marker
              .attr('opacity', 0)
              .transition()
              .duration(400)
              .attr('opacity', 1);
          } else {
            // Null pointer at the end of the chain
            cellGroup.append('line')
              .attr('x1', xPos)
              .attr('y1', yPos + nodeHeight / 2)
              .attr('x2', xPos)
              .attr('y2', yPos + nodeHeight / 2 + 15) // Short line for null
              .attr('stroke', '#ef4444')
              .attr('stroke-width', 1)
              .attr('opacity', 0)
              .transition()
              .duration(400)
              .attr('opacity', 1);

            cellGroup.append('text')
              .attr('x', xPos + 10)
              .attr('y', yPos + nodeHeight / 2 + 20)
              .attr('text-anchor', 'start')
              .attr('fill', '#ef4444')
              .attr('font-size', '12px')
              .text('NULL')
              .attr('opacity', 0)
              .transition()
              .duration(400)
              .attr('opacity', 1);
          }

          // Animate nodes
          const isActiveKey = (key === activeKey && d === activeIndex);
          keyGroup
            .transition()
            .duration(600)
            .attr('opacity', 1)
            .attr('transform', `translate(${xPos}, ${yPos}) scale(${isActiveKey ? 1.1 : 1})`)
            .ease(d3.easeElastic.amplitude(0.5).period(0.3));

          // Add hover effects
          keyGroup
            .on('mouseover', function() {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', `translate(${xPos}, ${yPos}) scale(1.1)`);
            })
            .on('mouseout', function() {
              const isActiveKey = (key === activeKey && d === activeIndex);
              d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', `translate(${xPos}, ${yPos}) scale(${isActiveKey ? 1.1 : 1})`);
            });

        } else { // Existing probing visualization logic
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

          // Remove existing connecting line for chaining, as it's now handled by the new chaining logic
          // This condition should prevent it from being drawn for probing
          if (index > 0 && collisionResolution === 'chaining') {
            // No longer needed, as chaining has its own visual representation
          }

          // Animate visible keys
          if (isVisible) {
            const isActiveKey = (key === activeKey && d === activeIndex)
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
                .attr('transform', `translate(${cellWidth / 2}, ${startY + (index * keySpacing)}) scale(1.1)`);
            })
            .on('mouseout', function() {
              const isActiveKey = (key === activeKey && d === activeIndex);
              d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', `translate(${cellWidth / 2}, ${startY + (index * keySpacing)}) scale(${isActiveKey ? 1.2 : 1})`);
            });
        }
      });

      // Add overflow indicator and hover effect only for chaining (adjust for new chaining visual)
      if (hasOverflow && collisionResolution === 'chaining') {
        const overflowCount = cellKeys.length - maxVisibleKeys;
        const overflowGroup = cellGroup
          .append('g')
          .attr('opacity', 0)
          .attr('transform', `translate(${cellWidth / 2}, ${startY + (maxVisibleKeys * nodeSpacing)})`); // Use nodeSpacing

        // Show overflow indicator (now just an invisible group to trigger hover)
        overflowGroup
          .transition()
          .duration(300)
          .attr('opacity', 1);

        // Create overflow display group (initially hidden)
        const overflowDisplay = cellGroup
          .append('g')
          .attr('class', 'overflow-display')
          .attr('opacity', 0)
          .attr('transform', `translate(0, ${cellHeight + 5})`);

        // Add overflow keys to display
        cellKeys.slice(maxVisibleKeys).forEach((key, index) => {
          const overflowKey = overflowDisplay
            .append('text')
            .attr('x', cellWidth / 2)
            .attr('y', index * nodeSpacing) // Use nodeSpacing
            .attr('text-anchor', 'middle')
            .attr('fill', '#000000')
            .attr('font-size', '14px')
            .attr('font-weight', '600')  // Make text bold
            .text(key);

          // Add connecting line for chaining in overflow
          overflowDisplay
            .append('line')
            .attr('x1', cellWidth / 2)
            .attr('y1', (index - 1) * nodeSpacing + nodeHeight / 2) // Use nodeSpacing and nodeHeight
            .attr('x2', cellWidth / 2)
            .attr('y2', index * nodeSpacing - nodeHeight / 2) // Use nodeSpacing and nodeHeight
            .attr('stroke', '#6b7280')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4');

          // Add hover effects for overflow keys
          overflowKey
            .on('mouseover', function() {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', '#2563eb')  // Change color on hover
                .attr('font-size', '16px');  // Slightly larger on hover
            })
            .on('mouseout', function() {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', '#000000')
                .attr('font-size', '14px');
            });
        });

        // Add hover effect to show overflow
        cellGroup
          .on('mouseover', function() {
            // Show overflow display
            overflowDisplay
              .transition()
              .duration(200)
              .attr('opacity', 1);
            
            // Hide overflow indicator
            overflowGroup
              .transition()
              .duration(200)
              .attr('opacity', 0);
          })
          .on('mouseout', function() {
            // Hide overflow display
            overflowDisplay
              .transition()
              .duration(200)
              .attr('opacity', 0);
            
            // Show overflow indicator
            overflowGroup
              .transition()
              .duration(200)
              .attr('opacity', 1);
          });
      }

      // Add collision indicator with enhanced animation (only for chaining)
      if (cellKeys.length > 1 && collisionResolution === 'chaining') {
        // Add collision label with bounce animation
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
          .attr('transform', 'translate(0, -5)')
          .transition()
          .duration(200)
          .attr('transform', 'translate(0, 0)')
          .text(`Collision: ${cellKeys.length} keys`);

        // Create collision animation group
        const collisionGroup = cellGroup
          .append('g')
          .attr('opacity', 0)
          .attr('transform', `translate(${cellWidth - 10}, 10) scale(0)`);

        // Add collision circle with glow effect
        collisionGroup
          .append('circle')
          .attr('r', 4)
          .attr('fill', '#ef4444')
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 2)
          .attr('filter', 'url(#glow)');

        // Enhanced collision animation
        const animateCollision = () => {
          collisionGroup
            .transition()
            .duration(800)
            .attr('opacity', 1)
            .attr('transform', `translate(${cellWidth - 10}, 10) scale(1)`)
            .ease(d3.easeElastic.amplitude(0.5).period(0.3))
            .on('end', () => {
              // Start pulsing animation
              const pulse = () => {
                collisionGroup
                  .transition()
                  .duration(1000)
                  .attr('transform', `translate(${cellWidth - 10}, 10) scale(1.2)`)
                  .transition()
                  .duration(1000)
                  .attr('transform', `translate(${cellWidth - 10}, 10) scale(1)`)
                  .on('end', pulse);
              };
              pulse();
            });
        };

        // Start collision animation
        animateCollision();

        // Add ripple effect for each collision
        cellKeys.forEach((_, index) => {
          const ripple = cellGroup
            .append('circle')
            .attr('cx', cellWidth / 2)
            .attr('cy', cellHeight / 2)
            .attr('r', 0)
            .attr('fill', 'none')
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 1)
            .attr('opacity', 0);

          ripple
            .transition()
            .delay(index * 200)
            .duration(1000)
            .attr('r', cellWidth)
            .attr('opacity', 0.3)
            .transition()
            .duration(500)
            .attr('opacity', 0)
            .remove();
        });
      }
    })

    // Add operation indicator with enhanced animation
    if (activeKey !== null) {
      const hash = typeof hashFunction === 'function'
        ? hashFunction(activeKey, size)
        : activeKey % size
      console.log(`Operation: ${operation} ${activeKey} at cell ${hash}`)

      const operationGroup = cells
        .filter((d) => d === activeIndex) // Filter by activeIndex as it's the final placement
        .append('g')
        .attr('opacity', 0)
        .attr('transform', `translate(${cellWidth / 2}, ${cellHeight - 5}) scale(0.8)`);

      operationGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', '#4b5563')
        .attr('font-size', '12px')
        .text(`${operation} ${activeKey}`);

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
        .attr('transform', `translate(${cellWidth / 2}, ${cellHeight - 15}) scale(0.8)`);
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
        <p>Keys: {keys?.length || 0}</p>
        <p>Collision Resolution: {collisionResolution}</p>
        {activeKey !== null && (
          <p className="mt-2">
            {operation} {activeKey} at index {activeIndex}
          </p>
        )}
      </div>
      
      {/* <CodeDisplay 
        operation={operation}
        key={activeKey}
        size={size}
      /> */}
    </div>
  )
} 