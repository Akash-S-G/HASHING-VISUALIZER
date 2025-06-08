import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

const defaultCode = `// Write a function that takes a key and table size as parameters
// and returns a hash index between 0 and size-1
(key, size) => {
  // Example: Division method
  // Make sure to handle negative numbers and ensure the result is within bounds
  return ((key % size) + size) % size;
}`;

export function CustomHashEditor({ onChange }) {
  const [code, setCode] = useState(defaultCode);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sampleKey, setSampleKey] = useState(42);
  const [sampleSize, setSampleSize] = useState(10);

  const validateAndExecuteCode = (newCode) => {
    setCode(newCode);
    setError(null);
    
    try {
      // Basic syntax validation
      if (!newCode.includes('=>')) {
        throw new Error('Function must be an arrow function');
      }
      
      // Create a function from the code string
      let fn;
      try {
        // eslint-disable-next-line no-new-func
        fn = new Function('key', 'size', `return (${newCode})(key, size);`);
      } catch (e) {
        throw new Error('Invalid function syntax: ' + e.message);
      }
      
      // Test the function with sample values
      const result = fn(sampleKey, sampleSize);
      
      // Validate the result
      if (typeof result !== 'number') {
        throw new Error('Function must return a number');
      }
      
      if (result < 0 || result >= sampleSize) {
        throw new Error(`Result must be between 0 and ${sampleSize - 1}`);
      }
      
      if (!Number.isInteger(result)) {
        throw new Error('Result must be an integer');
      }
      
      setPreview(result);
      setError(null);
      
      // Create a safe function that can be used by the hash table
      const safeFn = (key, size) => {
        try {
          const result = fn(key, size);
          if (typeof result !== 'number' || !Number.isInteger(result)) {
            return ((key % size) + size) % size; // Fallback to division method
          }
          return ((result % size) + size) % size; // Ensure result is within bounds
        } catch (e) {
          return ((key % size) + size) % size; // Fallback to division method
        }
      };
      
      onChange(safeFn);
    } catch (e) {
      setError(e.message);
      setPreview(null);
      // Provide a safe fallback function
      onChange((key, size) => ((key % size) + size) % size);
    }
  };

  useEffect(() => {
    validateAndExecuteCode(code);
    // eslint-disable-next-line
  }, [sampleKey, sampleSize]);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Custom Hash Function Editor
      </h2>
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        Write a JavaScript arrow function that takes <code>(key, size)</code> as parameters and returns a hash index between 0 and size-1.
      </div>
      <Editor
        value={code}
        onValueChange={validateAndExecuteCode}
        highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
        padding={12}
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 14,
          background: '#1a202c',
          color: '#f8f8f2',
          borderRadius: 8,
          minHeight: 120,
        }}
        className="mb-2 border border-gray-300 dark:border-gray-600"
      />
      {error && (
        <div className="text-red-500 text-sm mb-2">
          <strong>Error:</strong> {error}
        </div>
      )}
      <div className="flex items-center space-x-2 mb-2">
        <label className="text-sm">Sample key:</label>
        <input
          type="number"
          value={sampleKey}
          onChange={e => setSampleKey(Number(e.target.value))}
          className="input w-20"
        />
        <label className="text-sm">Table size:</label>
        <input
          type="number"
          value={sampleSize}
          onChange={e => setSampleSize(Number(e.target.value))}
          min="1"
          className="input w-20"
        />
        <span className="ml-4 text-sm">
          Output: <span className="font-mono">{preview !== null ? preview : '—'}</span>
        </span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        <p>Requirements:</p>
        <ul className="list-disc list-inside">
          {/* <li>Function must be an arrow function</li> */}
          <li>Must take (key, size) as parameters</li>
          <li>Must return an integer between 0 and size-1</li>
          <li>Should handle negative numbers</li>
        </ul>
      </div>
    </div>
  );
} 